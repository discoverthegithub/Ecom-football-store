/**
 * User Service
 * --------------
 * Business logic for user profiles, avatar uploads, and address management.
 */

import userRepository from './user.repository.js';
import ApiError from '../../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.config.js';

class UserService {
  // ──────────────────────────────────────────
  // Profile Management
  // ──────────────────────────────────────────

  /**
   * Update basic profile info.
   */
  async updateProfile(userId, updateData) {
    const user = await userRepository.updateProfile(userId, updateData);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return user;
  }

  /**
   * Upload and update user avatar.
   * Handles deleting the old avatar from Cloudinary.
   */
  async uploadAvatar(userId, fileBuffer) {
    const user = await userRepository.findById(userId);
    if (!user) {throw ApiError.notFound('User not found.');}

    // Upload to Cloudinary
    const result = await uploadToCloudinary(fileBuffer, 'avatars');

    // Delete old avatar if it exists and is hosted on Cloudinary
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    // Update user record
    const updatedUser = await userRepository.updateProfile(userId, {
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    return updatedUser;
  }

  // ──────────────────────────────────────────
  // Address Management
  // ──────────────────────────────────────────

  async addAddress(userId, addressData) {
    // Address model has a pre-save hook that automatically unsets previous
    // default if this one is set to default.
    return userRepository.createAddress({ ...addressData, user: userId });
  }

  async getUserAddresses(userId) {
    return userRepository.findAddressesByUser(userId);
  }

  async updateAddress(addressId, userId, updateData) {
    const address = await userRepository.findAddressByIdAndUser(addressId, userId);
    if (!address) {
      throw ApiError.notFound('Address not found or does not belong to user.');
    }

    // If making this address the default, we need to trigger the model's pre-save hook logic.
    // The repository's findOneAndUpdate doesn't trigger pre-save hooks reliably for complex ops.
    // So we fetch, update fields, and save() instead.
    Object.assign(address, updateData);
    await address.save(); // Triggers the pre('save') hook for isDefault logic

    return address;
  }

  async deleteAddress(addressId, userId) {
    const address = await userRepository.deleteAddress(addressId, userId);
    if (!address) {
      throw ApiError.notFound('Address not found or does not belong to user.');
    }
    return address;
  }

  // ──────────────────────────────────────────
  // Admin Operations
  // ──────────────────────────────────────────

  async getAllUsers(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.role) {filter.role = query.role;}
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.findAllUsers(skip, limit, '-createdAt', filter),
      userRepository.countUsers(filter),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId, isActive) {
    const user = await userRepository.updateUserStatus(userId, isActive);
    if (!user) {throw ApiError.notFound('User not found.');}
    return user;
  }

  async deleteUser(userId, currentAdminId) {
    if (userId.toString() === currentAdminId.toString()) {
      throw ApiError.badRequest('You cannot delete your own admin account.');
    }
    const user = await userRepository.deleteUser(userId);
    if (!user) {throw ApiError.notFound('User not found.');}
    return user;
  }
}

export default new UserService();
