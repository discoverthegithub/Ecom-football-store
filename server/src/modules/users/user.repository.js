/**
 * User Repository
 * -----------------
 * Data access layer for user and address operations.
 */

import User from './user.model.js';
import Address from './address.model.js';

class UserRepository {
  // ──────────────────────────────────────────
  // User Profile Operations
  // ──────────────────────────────────────────

  async findById(userId) {
    return User.findById(userId);
  }

  async updateProfile(userId, updateData) {
    return User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // ──────────────────────────────────────────
  // Address Operations
  // ──────────────────────────────────────────

  async createAddress(addressData) {
    return Address.create(addressData);
  }

  async findAddressesByUser(userId) {
    return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async findAddressByIdAndUser(addressId, userId) {
    return Address.findOne({ _id: addressId, user: userId });
  }

  async updateAddress(addressId, userId, updateData) {
    return Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteAddress(addressId, userId) {
    return Address.findOneAndDelete({ _id: addressId, user: userId });
  }

  // ──────────────────────────────────────────
  // Admin Operations
  // ──────────────────────────────────────────

  async findAllUsers(skip = 0, limit = 10, sort = '-createdAt', filter = {}) {
    return User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');
  }

  async countUsers(filter = {}) {
    return User.countDocuments(filter);
  }

  async updateUserStatus(userId, isActive) {
    return User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    );
  }

  async deleteUser(userId) {
    return User.findByIdAndDelete(userId);
  }
}

export default new UserRepository();
