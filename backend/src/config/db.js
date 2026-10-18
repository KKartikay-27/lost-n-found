import mongoose from 'mongoose';
import logger from '../logger.js';

export const connectDB = async (uri) => {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  logger.info('MongoDB connected');
};

export const isDBReady = () => mongoose.connection.readyState === 1;

export const disconnectDB = () => mongoose.disconnect();
