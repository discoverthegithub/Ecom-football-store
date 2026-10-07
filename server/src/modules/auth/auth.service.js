/**
 * Auth Service
 * ---------------
 * Contains all business logic for authentication.
 * Orchestrates between the repository, token helper, and email helper.
 *
 * The controller calls these methods — never contains business logic itself.
 */

import authRepository from './auth.repository.js';
import ApiError from '../../utils/ApiError.js';
import {
  generateTokenPair,
  generateRandomToken,
  hashToken,
  verifyRefreshToken,
} from '../../utils/tokenHelper.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from '../../utils/emailHelper.js';
import logger from '../../utils/logger.js';

class AuthService {
  /**
   * Register a new user.
   *
   * Flow:
   *   1. Check if email already exists
   *   2. Create user with hashed password (pre-save hook)
   *   3. Generate email verification token
   *   4. Send verification email
   *   5. Return user data (no tokens yet — must verify email first)
   *
   * @param {object} userData — { firstName, lastName, email, password }
   * @returns {Promise<object>} Created user (sanitized)
   */
  async register(userData) {
    // 1. Check for duplicate email
    const existingUser = await authRepository.findByEmail(userData.email);

    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    // 2. Create user (password hashing happens in the model pre-save hook)
    const user = await authRepository.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    });

    // 3. Generate verification token
    const { rawToken, hashedToken } = generateRandomToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await authRepository.setVerificationToken(user._id, hashedToken, verificationExpiry);

    // 4. Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.firstName, rawToken).catch((err) =>
      logger.error(`Failed to send verification email: ${err.message}`)
    );
    
    // For local development without SMTP configured, log the URL to the terminal
    logger.info(`🔗 LOCAL DEV: Verification URL for ${user.email} is http://localhost:5173/verify-email?token=${rawToken}`);

    // 5. Return sanitized user
    return {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  /**
   * Verify a user's email address.
   *
   * Flow:
   *   1. Hash the raw token
   *   2. Find user with matching token (and not expired)
   *   3. Mark user as verified
   *   4. Send welcome email
   *
   * @param {string} rawToken — Raw verification token from the URL
   * @returns {Promise<object>} Verified user
   */
  async verifyEmail(rawToken) {
    // 1. Hash the token
    const hashedToken = hashToken(rawToken);

    // 2. Find user by verification token
    const user = await authRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token.');
    }

    if (user.isVerified) {
      throw ApiError.badRequest('Email is already verified.');
    }

    // 3. Mark as verified
    await authRepository.markAsVerified(user._id);

    // 4. Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName).catch((err) =>
      logger.error(`Failed to send welcome email: ${err.message}`)
    );

    return { message: 'Email verified successfully.' };
  }

  /**
   * Log in a user with email and password.
   *
   * Flow:
   *   1. Find user by email
   *   2. Compare password
   *   3. Check if email is verified
   *   4. Generate token pair
   *   5. Store refresh token in DB
   *   6. Update last login
   *   7. Return tokens + user data
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
   */
  async login(email, password) {
    // 1. Find user with password
    const user = await authRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.unauthorized('Your account has been deactivated. Contact support.');
    }

    // 2. Compare password (Google-only accounts have no password)
    if (!user.password) {
      throw ApiError.unauthorized(
        'This account uses Google sign-in. Please log in with Google.'
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    // 3. Check email verification
    if (!user.isVerified) {
      throw ApiError.unauthorized(
        'Please verify your email before logging in. Check your inbox.'
      );
    }

    // 4. Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // 5. Store refresh token
    await authRepository.addRefreshToken(user._id, refreshToken);

    // 6. Update last login
    await authRepository.updateById(user._id, { lastLogin: new Date() });

    // 7. Return data
    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Log out a user by removing their refresh token.
   *
   * @param {string} userId — User's ID
   * @param {string} refreshToken — Refresh token to invalidate
   */
  async logout(userId, refreshToken) {
    if (refreshToken) {
      await authRepository.removeRefreshToken(userId, refreshToken);
    }
  }

  /**
   * Log out from all devices by clearing all refresh tokens.
   *
   * @param {string} userId — User's ID
   */
  async logoutAll(userId) {
    await authRepository.removeAllRefreshTokens(userId);
  }

  /**
   * Refresh the access token using a valid refresh token.
   *
   * Flow:
   *   1. Verify the refresh token JWT
   *   2. Find user who owns this token
   *   3. Check if token is in the user's stored tokens (token rotation detection)
   *   4. Remove the old refresh token
   *   5. Generate a new token pair
   *   6. Store the new refresh token
   *   7. Return new tokens
   *
   * @param {string} oldRefreshToken — Current refresh token
   * @returns {Promise<{ accessToken: string, refreshToken: string }>}
   */
  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw ApiError.unauthorized('Refresh token is required.');
    }

    // 1. Verify JWT
    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch (error) {
      throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.');
    }

    // 2. Find user with this specific refresh token
    const user = await authRepository.findByRefreshToken(oldRefreshToken);

    if (!user) {
      // Possible token reuse attack — invalidate all tokens for this user
      await authRepository.removeAllRefreshTokens(decoded.userId);
      logger.warn(`⚠️  Possible refresh token reuse detected for userId: ${decoded.userId}`);
      throw ApiError.unauthorized('Token reuse detected. All sessions have been invalidated. Please log in again.');
    }

    // 3. Check user is still active
    if (!user.isActive) {
      throw ApiError.unauthorized('Account has been deactivated.');
    }

    // 4. Remove old token (token rotation)
    await authRepository.removeRefreshToken(user._id, oldRefreshToken);

    // 5. Generate new pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

    // 6. Store new refresh token
    await authRepository.addRefreshToken(user._id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Send a password reset email.
   *
   * Flow:
   *   1. Find user by email
   *   2. Generate reset token
   *   3. Store hashed token with 1-hour expiry
   *   4. Send reset email
   *
   * @param {string} email
   */
  async forgotPassword(email) {
    // 1. Find user
    const user = await authRepository.findByEmail(email);

    // Always return success (prevent email enumeration)
    if (!user) {
      return { message: 'If an account with this email exists, a reset link has been sent.' };
    }

    // 2. Generate reset token
    const { rawToken, hashedToken } = generateRandomToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. Store token
    await authRepository.setPasswordResetToken(user._id, hashedToken, resetExpiry);

    // 4. Send email (non-blocking)
    sendPasswordResetEmail(user.email, user.firstName, rawToken).catch((err) =>
      logger.error(`Failed to send password reset email: ${err.message}`)
    );

    return { message: 'If an account with this email exists, a reset link has been sent.' };
  }

  /**
   * Reset password using a valid reset token.
   *
   * Flow:
   *   1. Hash the token
   *   2. Find user with valid (not expired) reset token
   *   3. Update password
   *   4. Clear reset token
   *   5. Invalidate all refresh tokens (force re-login)
   *
   * @param {string} rawToken — Reset token from the URL
   * @param {string} newPassword — New password
   */
  async resetPassword(rawToken, newPassword) {
    // 1. Hash token
    const hashedToken = hashToken(rawToken);

    // 2. Find user
    const user = await authRepository.findByResetToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token.');
    }

    // 3. Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await authRepository.saveUser(user);

    // 4. Invalidate all sessions
    await authRepository.removeAllRefreshTokens(user._id);

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  /**
   * Change password for an authenticated user.
   *
   * Flow:
   *   1. Find user with current password
   *   2. Verify current password
   *   3. Update to new password
   *   4. Invalidate all refresh tokens
   *
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    // 1. Find user with password field
    const user = await authRepository.findByIdWithPassword(userId);

    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    // 2. Verify current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect.');
    }

    // 3. Update password (triggers pre-save hook)
    user.password = newPassword;
    await authRepository.saveUser(user);

    // 4. Invalidate all sessions
    await authRepository.removeAllRefreshTokens(userId);

    return { message: 'Password changed successfully. Please log in again.' };
  }

  /**
   * Handle Google OAuth callback.
   * The user is already created/found by Passport — just generate tokens.
   *
   * @param {object} user — User document from Passport strategy
   * @returns {{ accessToken: string, refreshToken: string }}
   */
  async googleAuthCallback(user) {
    const { accessToken, refreshToken } = generateTokenPair(user);
    await authRepository.addRefreshToken(user._id, refreshToken);

    return { accessToken, refreshToken, user };
  }

  /**
   * Resend verification email.
   *
   * @param {string} email
   */
  async resendVerificationEmail(email) {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      // Prevent email enumeration
      return { message: 'If an account with this email exists, a verification link has been sent.' };
    }

    if (user.isVerified) {
      throw ApiError.badRequest('Email is already verified.');
    }

    // Generate new token
    const { rawToken, hashedToken } = generateRandomToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await authRepository.setVerificationToken(user._id, hashedToken, verificationExpiry);

    // Send email
    sendVerificationEmail(user.email, user.firstName, rawToken).catch((err) =>
      logger.error(`Failed to resend verification email: ${err.message}`)
    );

    return { message: 'If an account with this email exists, a verification link has been sent.' };
  }
}

export default new AuthService();
