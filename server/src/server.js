/**
 * Server Entry Point
 * -------------------
 * Starts the HTTP server after connecting to all external services.
 * Implements graceful shutdown to close connections cleanly on SIGTERM/SIGINT.
 *
 * Startup Order:
 *   1. Validate environment variables (via env.config.js import)
 *   2. Connect to MongoDB
 *   3. Connect to Redis
 *   4. Start Express HTTP server
 *   5. Register shutdown handlers
 */

import app from './app.js';
import env from './config/env.config.js';
import { connectDB, disconnectDB } from './config/db.config.js';
import { initializeRedis, disconnectRedis } from './config/redis.config.js';
import logger from './utils/logger.js';

/** @type {import('http').Server | null} */
let server = null;

/**
 * Initialize all external connections and start the HTTP server.
 */
const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Connect to Redis (non-critical — app continues if Redis fails)
    // await initializeRedis();

    // Step 3: Start the HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      logger.info(`📡 API Base: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
      logger.info(`❤️  Health: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`);
    });

    // Set server timeout (2 minutes)
    server.setTimeout(120000);
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 * -----------------
 * Closes all connections cleanly before the process exits.
 * Prevents data corruption and connection leaks.
 */
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Step 1: Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('🔌 HTTP server closed');
    });
  }

  try {
    // Step 2: Close database connections
    await disconnectDB();
    // await disconnectRedis();

    logger.info('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Error during shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { reason });
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Start the server
startServer();
