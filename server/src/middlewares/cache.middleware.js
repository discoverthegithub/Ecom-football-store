import { getRedisClient } from '../config/redis.config.js';
import logger from '../utils/logger.js';

/**
 * Middleware to cache HTTP GET responses in Redis.
 * Only caches responses with a 200 OK status.
 * 
 * @param {string} prefix - The unique prefix for this group of routes (e.g. 'products')
 * @param {number} ttl - Time to live in seconds (default: 600s / 10m)
 */
export const cacheRoute = (prefix, ttl = 600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redis = getRedisClient();
    
    // If Redis is not connected, gracefully bypass caching
    if (!redis) {
      return next();
    }

    // Generate a unique cache key based on the URL (including query params)
    // Example: cache:products:/api/v1/products?category=123&sort=price
    const key = `cache:${prefix}:${req.originalUrl}`;

    try {
      // 1. Check if the response exists in Redis
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        // Cache HIT: Parse and send the cached JSON response
        logger.debug(`⚡ Cache HIT for key: ${key}`);
        const data = JSON.parse(cachedResponse);
        return res.status(200).json(data);
      }

      // Cache MISS: Proceed to the controller
      logger.debug(`🐢 Cache MISS for key: ${key}`);

      // 2. Intercept the res.json() method to capture the payload
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Only cache successful 200 OK responses
        if (res.statusCode === 200) {
          redis.setex(key, ttl, JSON.stringify(body)).catch((err) => {
            logger.error(`❌ Redis SETEX error: ${err.message}`);
          });
        }
        
        // Call the original res.json to send the response to the client
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`❌ Redis Cache Middleware Error: ${error.message}`);
      next(); // If caching fails, continue without caching
    }
  };
};

export default cacheRoute;
