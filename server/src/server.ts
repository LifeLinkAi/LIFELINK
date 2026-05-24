import dotenv from 'dotenv';
// Load environment variables before importing other app modules
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import mongoose from 'mongoose';

const server = http.createServer(app);

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
