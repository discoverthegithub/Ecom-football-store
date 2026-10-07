/**
 * Auth Routes
 * -------------
 * Maps HTTP endpoints to controller methods.
 * Applies validation and authentication middleware where needed.
 *
 * Public routes: register, login, verify-email, forgot-password, reset-password, google
 * Protected routes: logout, logout-all, refresh-token, change-password, me
 */

import { Router } from 'express';
import passport from 'passport';

import authController from './auth.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailParamsSchema,
  resetPasswordParamsSchema,
} from './auth.validator.js';

const router = Router();

// ──────────────────────────────────────────
// Public Routes (no auth required)
// ──────────────────────────────────────────

// Register
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

// Verify email
router.get(
  '/verify-email/:token',
  validate(verifyEmailParamsSchema, 'params'),
  authController.verifyEmail
);

// Resend verification
router.post(
  '/resend-verification',
  authLimiter,
  validate(forgotPasswordSchema), // Same schema — just email
  authController.resendVerification
);

// Login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// Refresh token (no auth middleware — uses cookie)
router.post(
  '/refresh-token',
  authController.refreshToken
);

// Forgot password
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password/:token',
  authLimiter,
  validate(resetPasswordParamsSchema, 'params'),
  validate(resetPasswordSchema),
  authController.resetPassword
);

// ──────────────────────────────────────────
// Google OAuth Routes
// ──────────────────────────────────────────

// Initiate Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/google/failure',
  }),
  authController.googleCallback
);

// Google OAuth failure
router.get('/google/failure', (_req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google authentication failed.',
  });
});

// ──────────────────────────────────────────
// Protected Routes (auth required)
// ──────────────────────────────────────────

// Get current user
router.get('/me', authenticate, authController.getMe);

// Logout
router.post('/logout', authenticate, authController.logout);

// Logout from all devices
router.post('/logout-all', authenticate, authController.logoutAll);

// Change password
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export default router;
