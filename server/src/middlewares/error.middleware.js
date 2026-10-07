/**
 * Global Error Handler Middleware
 * --------------------------------
 * Catches all errors thrown in the app and returns a standardized JSON response.
 *
 * Handles:
 *   - ApiError instances (operational errors)
 *   - Mongoose validation errors
 *   - Mongoose duplicate key errors
 *   - Mongoose cast errors (invalid ObjectId)
 *   - JWT errors
 *   - Multer file upload errors
 *   - Unknown/unexpected errors
 *
 * IMPORTANT: This middleware MUST be registered LAST in app.js
 */

import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/**
 * Normalize Mongoose validation errors into a standard format.
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  return new ApiError(422, 'Validation failed', errors);
};

/**
 * Handle MongoDB duplicate key (E11000) errors.
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  return new ApiError(409, `Duplicate value for: ${field}. Please use a different value.`);
};

/**
 * Handle invalid Mongoose ObjectId cast errors.
 */
const handleCastError = (err) => {
  return new ApiError(400, `Invalid value for ${err.path}: ${err.value}`);
};

/**
 * Handle JWT token errors.
 */
const handleJwtError = () => {
  return new ApiError(401, 'Invalid token. Please log in again.');
};

/**
 * Handle JWT token expiration.
 */
const handleJwtExpiredError = () => {
  return new ApiError(401, 'Token expired. Please log in again.');
};

/**
 * Handle Multer file upload errors.
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new ApiError(400, 'File too large. Maximum size is 5MB.');
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new ApiError(400, 'Too many files. Maximum is 10 files.');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ApiError(400, 'Unexpected file field.');
  }
  return new ApiError(400, err.message);
};

/**
 * Main error handler middleware.
 * Express identifies this as an error handler because it has 4 parameters.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    error = handleJwtError();
  }

  // JWT expired
  if (err.name === 'TokenExpiredError') {
    error = handleJwtExpiredError();
  }

  // Multer upload errors
  if (err.name === 'MulterError') {
    error = handleMulterError(err);
  }

  // If it's an ApiError, use its statusCode; otherwise default to 500
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Log the error
  if (statusCode >= 500) {
    logger.error('Server Error', {
      statusCode,
      message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client Error', {
      statusCode,
      message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Build the response
  const response = {
    success: false,
    message,
    ...(error.errors?.length && { errors: error.errors }),
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

export default errorHandler;
