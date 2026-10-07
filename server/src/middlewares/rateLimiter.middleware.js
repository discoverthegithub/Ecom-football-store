/**
 * Rate Limiter Middleware
 * -----------------------
 * Protects the API from abuse by limiting the number of requests
 * a single IP can make within a time window.
 *
 * Uses express-rate-limit with config values from environment variables.
 * Returns a standardized JSON error response when limit is exceeded.
 */

import rateLimit from 'express-rate-limit';
import env from '../config/env.config.js';

/**
 * Global API rate limiter.
 * Default: 100 requests per 15 minutes per IP.
 */
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  // Skip rate limiting in test environment
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Strict rate limiter for sensitive endpoints (login, register, password reset).
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skip: () => env.NODE_ENV === 'test',
});

export { globalLimiter, authLimiter };
