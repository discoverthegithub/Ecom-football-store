/**
 * Authentication Middleware
 * --------------------------
 * Verifies JWT access tokens from the Authorization header.
 * Attaches the authenticated user to `req.user`.
 *
 * Expected header format: `Authorization: Bearer <token>`
 *
 * Flow:
 *   1. Extract token from Authorization header
 *   2. Verify token signature and expiry
 *   3. Find the user in the database
 *   4. Check if user still exists and is active
 *   5. Check if password was changed after token was issued
 *   6. Attach user to request
 */

import { verifyAccessToken } from '../utils/tokenHelper.js';
import ApiError from '../utils/ApiError.js';
import User from '../modules/users/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';

const authenticate = asyncHandler(async (req, _res, next) => {
  // 1. Extract token from Authorization header
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired. Please refresh your token.');
    }
    throw ApiError.unauthorized('Invalid token. Please log in again.');
  }

  // 3. Find user — include passwordChangedAt for step 5
  const user = await User.findById(decoded.userId).select('+passwordChangedAt');

  // 4. Check if user still exists and is active
  if (!user) {
    throw ApiError.unauthorized('User no longer exists.');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Account has been deactivated.');
  }

  // 5. Check if password was changed after token was issued
  if (user.isPasswordChangedAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was recently changed. Please log in again.');
  }

  // 6. Attach user to request (available to all subsequent middleware/controllers)
  req.user = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };

  next();
});

export default authenticate;
