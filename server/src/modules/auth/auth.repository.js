/**
 * Auth Repository
 * -----------------
 * Data access layer for authentication-related user operations.
 * This is the ONLY layer that interacts directly with the User model.
 *
 * The service layer calls these methods — never accesses Mongoose directly.
 */

import User from '../users/user.model.js';

class AuthRepository {
  /**
   * Create a new user.
   * @param {object} userData — { firstName, lastName, email, password, ... }
   * @returns {Promise<object>} Created user document
   */
  async createUser(userData) {
    return User.create(userData);
  }

  /**
   * Find a user by email. Includes password for authentication.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    return User.findOne({ email }).select('+password +refreshTokens');
  }

  /**
   * Find a user by ID.
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async findById(userId) {
    return User.findById(userId);
  }

  /**
   * Find a user by ID with password field.
   * @param {string} userId
   * @returns {Promise<object|null>}
   */
  async findByIdWithPassword(userId) {
    return User.findById(userId).select('+password');
  }

  /**
   * Find a user by Google ID.
   * @param {string} googleId
   * @returns {Promise<object|null>}
   */
  async findByGoogleId(googleId) {
    return User.findOne({ googleId });
  }

  /**
   * Find a user by email verification token (hashed).
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findByVerificationToken(hashedToken) {
    return User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpiry');
  }

  /**
   * Find a user by password reset token (hashed).
   * @param {string} hashedToken
   * @returns {Promise<object|null>}
   */
  async findByResetToken(hashedToken) {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpiry +password');
  }

  /**
   * Update a user by ID.
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object|null>}
   */
  async updateById(userId, updateData) {
    return User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Save a user document (for pre-save hooks like password hashing).
   * @param {object} user — Mongoose user document
   * @returns {Promise<object>}
   */
  async saveUser(user) {
    return user.save();
  }

  /**
   * Add a refresh token to the user's token array.
   * @param {string} userId
   * @param {string} refreshToken
   */
  async addRefreshToken(userId, refreshToken) {
    return User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: refreshToken },
    });
  }

  /**
   * Remove a specific refresh token from the user's token array.
   * @param {string} userId
   * @param {string} refreshToken
   */
  async removeRefreshToken(userId, refreshToken) {
    return User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: refreshToken },
    });
  }

  /**
   * Remove all refresh tokens for a user (logout from all devices).
   * @param {string} userId
   */
  async removeAllRefreshTokens(userId) {
    return User.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  }

  /**
   * Find a user who has a specific refresh token.
   * @param {string} refreshToken
   * @returns {Promise<object|null>}
   */
  async findByRefreshToken(refreshToken) {
    return User.findOne({ refreshTokens: refreshToken }).select('+refreshTokens');
  }

  /**
   * Set email verification token and expiry.
   * @param {string} userId
   * @param {string} hashedToken
   * @param {Date} expiry
   */
  async setVerificationToken(userId, hashedToken, expiry) {
    return User.findByIdAndUpdate(userId, {
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: expiry,
    });
  }

  /**
   * Mark user as verified and clear verification fields.
   * @param {string} userId
   */
  async markAsVerified(userId) {
    return User.findByIdAndUpdate(userId, {
      isVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpiry: undefined,
    });
  }

  /**
   * Set password reset token and expiry.
   * @param {string} userId
   * @param {string} hashedToken
   * @param {Date} expiry
   */
  async setPasswordResetToken(userId, hashedToken, expiry) {
    return User.findByIdAndUpdate(userId, {
      passwordResetToken: hashedToken,
      passwordResetExpiry: expiry,
    });
  }

  /**
   * Clear password reset fields after successful reset.
   * @param {string} userId
   */
  async clearPasswordResetToken(userId) {
    return User.findByIdAndUpdate(userId, {
      passwordResetToken: undefined,
      passwordResetExpiry: undefined,
    });
  }
}

export default new AuthRepository();
