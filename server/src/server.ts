import dotenv from 'dotenv';
import path from 'path';
// Load environment variables before importing other app modules
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import mongoose from 'mongoose';
import { startWellnessScheduler } from './services/notifications/wellnessScheduler.service';
import { initSocketServer } from './sockets';

const server = http.createServer(app);
initSocketServer(server);

// Graceful shutdown routine
const gracefulShutdown = (): void => {
  logger.info(' Termination signal received. Commencing graceful shutdown...');
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    } catch (err: any) {
      logger.error(`Error during MongoDB connection shutdown: ${err.message}`);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if connections hang
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000);
};

const startServer = async (): Promise<void> => {
  // Connect to Database
  await connectDB();

  // ── Startup migration: drop ALL 2dsphere indexes + fix corrupt documents ──
  // MongoDB Atlas has stale 2dsphere indexes on donorprofiles (both on the
  // `coordinates` and `location` string field). These block every upsert.
  // Fix: enumerate all indexes, drop any with a 2dsphere key, then clean docs.
  try {
    const rawCollection = mongoose.connection.db!.collection('donorprofiles');

    // Step 1: List all indexes and drop every 2dsphere one
    const indexes = await rawCollection.listIndexes().toArray();
    for (const idx of indexes) {
      const has2dsphere = idx.key && Object.values(idx.key).includes('2dsphere');
      if (has2dsphere && !idx.key.location) {
        try {
          await rawCollection.dropIndex(idx.name as string);
          logger.info(`Startup: Dropped 2dsphere index "${idx.name}" from donorprofiles`);
        } catch (dropErr: any) {
          logger.warn(`Startup: Could not drop index "${idx.name}": ${dropErr.message}`);
        }
      }
    }

    // Step 2: Clean documents with coordinates: [] (invalid for 2dsphere)
    const fixResult = await rawCollection.updateMany(
      { coordinates: { $exists: true, $size: 0 } },
      { $unset: { coordinates: '' } }
    );
    if (fixResult.modifiedCount > 0) {
      logger.info(`Startup: Removed empty coordinates from ${fixResult.modifiedCount} DonorProfile documents`);
    }

    logger.info('Startup migration complete — all 2dsphere indexes removed.');
  } catch (migErr: any) {
    logger.warn(`Startup migration warning: ${migErr.message}`);
  }
  // ──────────────────────────────────────────────────────────────────────────


  // Start the Living Donor Wellness check-up reminders scheduler
  startWellnessScheduler();

  // Start HTTP Server listener
  const port = process.env.PORT || 5000;
  const nodeEnv = process.env.NODE_ENV || 'development';
  server.listen(port, () => {
    logger.info(` LifeLink Server running in ${nodeEnv} mode on port ${port}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(` Unhandled Rejection: ${err.message}`);
  if (err.stack) {
    logger.error(err.stack);
  }
  gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(` Uncaught Exception: ${err.message}`);
  if (err.stack) {
    logger.error(err.stack);
  }
  process.exit(1);
});

// Register termination signal event listeners
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
