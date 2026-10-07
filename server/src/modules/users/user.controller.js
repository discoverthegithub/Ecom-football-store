/**
 * User Controller
 * -----------------
 * Handles HTTP requests for user profiles and addresses.
 */

import userService from './user.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';

class UserController {
  // ──────────────────────────────────────────
  // Profile Management
  // ──────────────────────────────────────────

  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user._id, req.body);
    ApiResponse.ok(res, user, 'Profile updated successfully.');
  });

  uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw ApiError.badRequest('Please upload an image file.');
    }

    const user = await userService.uploadAvatar(req.user._id, req.file.buffer);
    ApiResponse.ok(res, user, 'Avatar uploaded successfully.');
  });

  // ──────────────────────────────────────────
  // Address Management
  // ──────────────────────────────────────────

  addAddress = asyncHandler(async (req, res) => {
    const address = await userService.addAddress(req.user._id, req.body);
    ApiResponse.created(res, address, 'Address added successfully.');
  });

  getAddresses = asyncHandler(async (req, res) => {
    const addresses = await userService.getUserAddresses(req.user._id);
    ApiResponse.ok(res, addresses, 'Addresses fetched successfully.');
  });

  updateAddress = asyncHandler(async (req, res) => {
    const address = await userService.updateAddress(
      req.params.id,
      req.user._id,
      req.body
    );
    ApiResponse.ok(res, address, 'Address updated successfully.');
  });

  deleteAddress = asyncHandler(async (req, res) => {
    await userService.deleteAddress(req.params.id, req.user._id);
    ApiResponse.ok(res, null, 'Address deleted successfully.');
  });

  // ──────────────────────────────────────────
  // Admin Operations
  // ──────────────────────────────────────────

  getAllUsers = asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    ApiResponse.ok(res, result, 'Users fetched successfully.');
  });

  updateUserStatus = asyncHandler(async (req, res) => {
    const user = await userService.updateUserStatus(req.params.id, req.body.isActive);
    ApiResponse.ok(res, user, `User account has been ${req.body.isActive ? 'activated' : 'deactivated'}.`);
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id, req.user._id);
    ApiResponse.ok(res, null, 'User account deleted successfully.');
  });
}

export default new UserController();
