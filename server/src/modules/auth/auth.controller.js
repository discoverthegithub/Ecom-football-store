/**
 * Auth Controller
 * -----------------
 * Handles HTTP requests for authentication endpoints.
 *
 * Responsibilities (ONLY):
 *   - Parse request data
 *   - Call the appropriate service method
 *   - Return the HTTP response
 *
 * NO business logic. NO database queries. NO email sending.
 */

import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../../utils/tokenHelper.js';

class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new user account.
   */
  register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    ApiResponse.created(res, user, 'Registration successful. Please check your email to verify your account.');
  });

  /**
   * GET /api/v1/auth/verify-email/:token
   * Verify user's email address.
   */
  verifyEmail = asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.params.token);

    ApiResponse.ok(res, null, result.message);
  });

  /**
   * POST /api/v1/auth/resend-verification
   * Resend email verification link.
   */
  resendVerification = asyncHandler(async (req, res) => {
    const result = await authService.resendVerificationEmail(req.body.email);

    ApiResponse.ok(res, null, result.message);
  });

  /**
   * POST /api/v1/auth/login
   * Log in with email and password.
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    // Set refresh token as HTTP-only cookie
    setRefreshTokenCookie(res, refreshToken);

    ApiResponse.ok(res, { accessToken, user }, 'Login successful.');
  });

  /**
   * POST /api/v1/auth/logout
   * Log out (invalidate current refresh token).
   */
  logout = asyncHandler(async (req, res) => {
    const refreshToken = req.signedCookies?.refreshToken;

    await authService.logout(req.user._id, refreshToken);

    // Clear the cookie
    clearRefreshTokenCookie(res);

    ApiResponse.ok(res, null, 'Logged out successfully.');
  });

  /**
   * POST /api/v1/auth/logout-all
   * Log out from all devices.
   */
  logoutAll = asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user._id);

    clearRefreshTokenCookie(res);

    ApiResponse.ok(res, null, 'Logged out from all devices.');
  });

  /**
   * POST /api/v1/auth/refresh-token
   * Refresh access token using refresh token cookie.
   */
  refreshToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.signedCookies?.refreshToken;

    const { accessToken, refreshToken } = await authService.refreshToken(oldRefreshToken);

    // Set new refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    ApiResponse.ok(res, { accessToken }, 'Token refreshed successfully.');
  });

  /**
   * POST /api/v1/auth/forgot-password
   * Send password reset email.
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);

    ApiResponse.ok(res, null, result.message);
  });

  /**
   * POST /api/v1/auth/reset-password/:token
   * Reset password with token.
   */
  resetPassword = asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.params.token, req.body.password);

    clearRefreshTokenCookie(res);

    ApiResponse.ok(res, null, result.message);
  });

  /**
   * PATCH /api/v1/auth/change-password
   * Change password for authenticated user.
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

    clearRefreshTokenCookie(res);

    ApiResponse.ok(res, null, result.message);
  });

  /**
   * GET /api/v1/auth/google
   * Initiate Google OAuth flow (handled by Passport).
   */
  // Handled directly in routes via passport.authenticate()

  /**
   * GET /api/v1/auth/google/callback
   * Google OAuth callback — generate tokens and redirect to client.
   */
  googleCallback = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await authService.googleAuthCallback(req.user);

    // Set refresh token cookie
    setRefreshTokenCookie(res, refreshToken);

    // Redirect to client with access token
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${accessToken}`);
  });

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user.
   */
  getMe = asyncHandler(async (req, res) => {
    ApiResponse.ok(res, { user: req.user }, 'User fetched successfully.');
  });
}

export default new AuthController();
