/**
 * Request Logger Middleware
 * -------------------------
 * Logs every incoming HTTP request with method, URL, status code,
 * response time, and content length.
 *
 * Uses Winston's 'http' log level so it can be toggled via LOG_LEVEL.
 */

import logger from '../utils/logger.js';

/**
 * Express middleware that logs request details after the response is sent.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Listen for when the response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || 0,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    };

    // Use different log levels based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};

export default requestLogger;
