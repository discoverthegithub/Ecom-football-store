/**
 * Redis Configuration
 * -------------------
 * Handles Redis connection via ioredis with automatic reconnection,
 * event listeners, and graceful disconnection.
 */

import Redis from 'ioredis';
import env from './env.config.js';
import logger from '../utils/logger.js';

/** @type {Redis | null} */
let redisClient = null;

/**
 * Create and return a Redis client instance.
 * Re-uses existing connection if already established.
 */
const connectRedis = () => {
  if (redisClient) {
    return redisClient;
  }

  const options = {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 5) {
        logger.error('❌ Redis: max retries reached. Giving up.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 1000, 5000);
      logger.warn(`⚠️  Redis retry attempt ${times}. Retrying in ${delay / 1000}s...`);
      return delay;
    },
    lazyConnect: true,
  };

  // Only set password if provided
  if (env.REDIS_PASSWORD) {
    options.password = env.REDIS_PASSWORD;
  }

  redisClient = new Redis(options);

  // Connection event listeners
  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis ready to accept commands');
  });

  redisClient.on('error', (err) => {
    logger.error(`❌ Redis error: ${err.message}`);
  });

  redisClient.on('close', () => {
    logger.warn('⚠️  Redis connection closed');
  });

  redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis reconnecting...');
  });

  return redisClient;
};

/**
 * Initialize the Redis connection.
 * Separate from connectRedis() so we can await the connection in server startup.
 */
const initializeRedis = async () => {
  const client = connectRedis();

  try {
    await client.connect();
    logger.info(`✅ Redis connected: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
  } catch (error) {
    logger.error(`❌ Redis connection failed: ${error.message}`);
    // Redis is non-critical — the app can run without it (with degraded caching)
    logger.warn('⚠️  App will continue without Redis caching');
  }

  return client;
};

/**
 * Gracefully close the Redis connection.
 * Called during server shutdown.
 */
const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('🔌 Redis disconnected gracefully');
    } catch (error) {
      logger.error(`❌ Error disconnecting Redis: ${error.message}`);
    }
  }
};

/**
 * Get the current Redis client instance.
 * Returns null if not connected.
 */
const getRedisClient = () => redisClient;

export { connectRedis, initializeRedis, disconnectRedis, getRedisClient };
