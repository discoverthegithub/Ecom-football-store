/**
 * Custom API Error Class
 * ----------------------
 * Extends the native Error class to include HTTP status codes,
 * error arrays, and operational vs. programming error distinction.
 *
 * Usage:
 *   throw new ApiError(404, 'Product not found');
 *   throw new ApiError(422, 'Validation failed', ['Email is required', 'Password too short']);
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode — HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} message — Human-readable error message
   * @param {string[]} errors — Array of detailed error messages (e.g., validation errors)
   * @param {boolean} isOperational — Whether this is an expected operational error
   * @param {string} stack — Optional stack trace override
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], isOperational = true, stack = '') {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ---- Factory Methods for Common Errors ----

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Resource already exists') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Validation failed', errors = []) {
    return new ApiError(422, message, errors);
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.') {
    return new ApiError(429, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, [], false);
  }
}

export default ApiError;
