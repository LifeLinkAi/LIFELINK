import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lifelink';
    const conn = await mongoose.connect(mongoUri);
    logger.info(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    logger.error(` MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn(' MongoDB connection lost.');
});

mongoose.connection.on('error', (err) => {
  logger.error(` MongoDB runtime connection error: ${err.message}`);
});
