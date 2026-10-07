import { getRedisClient } from '../config/redis.config.js';
import logger from './logger.js';

/**
 * Clear all cache keys that match a specific prefix pattern.
 * Uses SCAN instead of KEYS for better performance on large datasets.
 * 
 * @param {string} prefix - The cache prefix to clear (e.g., 'products', 'categories')
 */
export const clearCache = async (prefix) => {
  const redis = getRedisClient();
  if (!redis) return; // Fail silently if Redis isn't connected

  try {
    let cursor = '0';
    let count = 0;
    
    // We append '*' to match any query parameters stored under this prefix
    const matchPattern = `cache:${prefix}:*`;

    do {
      // Use SCAN to avoid blocking the single-threaded Redis server
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', matchPattern, 'COUNT', '100');
      cursor = newCursor;

      if (keys.length > 0) {
        // Delete the keys found in this batch
        await redis.del(...keys);
        count += keys.length;
      }
    } while (cursor !== '0');

    if (count > 0) {
      logger.info(`🧹 Cache cleared: ${count} keys starting with "${prefix}"`);
    }
  } catch (error) {
    logger.error(`❌ Error clearing cache for prefix "${prefix}": ${error.message}`);
  }
};

export default {
  clearCache
};
