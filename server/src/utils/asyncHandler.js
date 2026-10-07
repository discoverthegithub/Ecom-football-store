/**
 * Async Handler (Express Async Wrapper)
 * --------------------------------------
 * Wraps async route handlers to automatically catch errors
 * and forward them to the global error middleware.
 *
 * Without this, every async controller would need its own try/catch.
 *
 * Usage:
 *   router.get('/products', asyncHandler(productController.getAll));
 */

/**
 * @param {Function} fn — Async Express route handler (req, res, next) => Promise
 * @returns {Function} Express middleware with automatic error forwarding
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
