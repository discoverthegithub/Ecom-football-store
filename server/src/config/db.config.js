/**
 * Database Configuration
 * ----------------------
 * Handles MongoDB connection via Mongoose with retry logic,
 * connection event listeners, and graceful disconnection.
 */

import mongoose from 'mongoose';
import env from './env.config.js';
import logger from '../utils/logger.js';

/** Maximum number of connection retry attempts before giving up */
const MAX_RETRIES = 5;

/** Delay between retries in milliseconds (increases with each attempt) */
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB with exponential backoff retry logic.
 * Registers event listeners for connection lifecycle events.
 */
const connectDB = async () => {
  let retries = 0;

  const attemptConnection = async () => {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        // Mongoose 8 defaults are sane; explicit options for documentation
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      retries += 1;

      if (retries >= MAX_RETRIES) {
        logger.error(`❌ MongoDB connection failed after ${MAX_RETRIES} attempts`);
        logger.error(error.message);
        process.exit(1);
      }

      const delay = RETRY_DELAY_MS * retries;
      logger.warn(
        `⚠️  MongoDB connection attempt ${retries}/${MAX_RETRIES} failed. Retrying in ${delay / 1000}s...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      return attemptConnection();
    }
  };

  // Connection event listeners
  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB error: ${err.message}`);
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('✅ MongoDB reconnected');
  });

  await attemptConnection();
};

/**
 * Gracefully close the MongoDB connection.
 * Called during server shutdown.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('🔌 MongoDB disconnected gracefully');
  } catch (error) {
    logger.error(`❌ Error disconnecting MongoDB: ${error.message}`);
  }
};

export { connectDB, disconnectDB };
