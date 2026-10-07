/**
 * Token Helper
 * --------------
 * Generates and verifies JWT access and refresh tokens.
 * Access tokens are short-lived (15m), refresh tokens are long-lived (7d).
 *
 * Access Token: sent in response body, stored in memory on the client
 * Refresh Token: sent as HTTP-only secure cookie
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.config.js';

/**
 * Generate a JWT access token.
 * @param {object} payload — Data to embed in the token (userId, role)
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
};

/**
 * Generate a JWT refresh token.
 * @param {object} payload — Data to embed in the token (userId)
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
};

/**
 * Generate both access and refresh tokens for a user.
 * @param {object} user — User document (needs _id and role)
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (user) => {
  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  return { accessToken, refreshToken };
};

/**
 * Verify a JWT access token.
 * @param {string} token — JWT access token string
 * @returns {object} Decoded token payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify a JWT refresh token.
 * @param {string} token — JWT refresh token string
 * @returns {object} Decoded token payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/**
 * Generate a random token for email verification or password reset.
 * Returns both the raw token (sent to user) and hashed token (stored in DB).
 * @returns {{ rawToken: string, hashedToken: string }}
 */
const generateRandomToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

/**
 * Hash a raw token for comparison with the stored hashed version.
 * @param {string} rawToken — The raw token to hash
 * @returns {string} SHA-256 hashed token
 */
const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Set refresh token as HTTP-only cookie on the response.
 * @param {import('express').Response} res — Express response object
 * @param {string} refreshToken — JWT refresh token
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
    signed: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

/**
 * Clear the refresh token cookie.
 * @param {import('express').Response} res — Express response object
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
    signed: true,
  });
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
