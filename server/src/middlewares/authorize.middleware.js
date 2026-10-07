/**
 * Authorization Middleware (RBAC)
 * --------------------------------
 * Role-Based Access Control middleware.
 * Restricts access to routes based on user roles.
 *
 * Must be used AFTER the authenticate middleware.
 *
 * Usage:
 *   router.delete('/products/:id', authenticate, authorize('admin', 'super_admin'), controller.delete);
 */

import ApiError from '../utils/ApiError.js';

/**
 * Creates middleware that restricts access to specified roles.
 * @param {...string} allowedRoles — Roles permitted to access the route
 * @returns {import('express').RequestHandler}
 */
const authorize = (...allowedRoles) => {
  return (req, _res, next) => {
    // authenticate middleware must run first
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

export default authorize;
