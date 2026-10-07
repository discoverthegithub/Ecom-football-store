/**
 * User Routes
 * -------------
 * Maps HTTP endpoints to user controller methods.
 * All routes here require authentication.
 */

import { Router } from 'express';
import userController from './user.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { uploadAvatar } from '../../middlewares/upload.middleware.js';
import { USER_ROLES } from '../../utils/constants.js';

import {
  updateProfileSchema,
  addressSchema,
  addressParamsSchema,
  updateStatusSchema,
  userParamsSchema,
} from './user.validator.js';

const router = Router();

// Require authentication for all user routes
router.use(authenticate);

// ──────────────────────────────────────────
// Profile Routes
// ──────────────────────────────────────────

// Update profile info
router.patch(
  '/profile',
  validate(updateProfileSchema),
  userController.updateProfile
);

// Upload avatar
router.post(
  '/avatar',
  uploadAvatar.single('avatar'),
  userController.uploadAvatar
);

// ──────────────────────────────────────────
// Address Routes
// ──────────────────────────────────────────

// Get all addresses for user
router.get('/addresses', userController.getAddresses);

// Add new address
router.post(
  '/addresses',
  validate(addressSchema),
  userController.addAddress
);

// Update address
router.put(
  '/addresses/:id',
  validate(addressParamsSchema, 'params'),
  validate(addressSchema),
  userController.updateAddress
);

// Delete address
router.delete(
  '/addresses/:id',
  validate(addressParamsSchema, 'params'),
  userController.deleteAddress
);

// ──────────────────────────────────────────
// Admin Routes
// ──────────────────────────────────────────

// Require admin or super_admin for the following routes
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

// Get all users (with pagination and search)
router.get('/', userController.getAllUsers);

// Deactivate/Activate user account
router.patch(
  '/:id/status',
  validate(userParamsSchema, 'params'),
  validate(updateStatusSchema),
  userController.updateUserStatus
);

// Delete user account
router.delete(
  '/:id',
  validate(userParamsSchema, 'params'),
  userController.deleteUser
);

export default router;
