/**
 * Dashboard & Settings Routes
 * ---------------------------
 */

import { Router } from 'express';
import dashboardController from './dashboard.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { uploadProductImage } from '../../middlewares/upload.middleware.js'; // Reuse for logo
import { USER_ROLES } from '../../utils/constants.js';

import { updateSettingsSchema } from './settings.validator.js';

const router = Router();

// Public: Get global settings for frontend rendering (logo, name, etc.)
router.get('/settings', dashboardController.getSettings);

// ──────────────────────────────────────────
// Admin Routes
// ──────────────────────────────────────────

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.get('/metrics', dashboardController.getMetrics);
router.get('/logs', dashboardController.getActivityLogs);

router.put(
  '/settings',
  uploadProductImage.single('logo'),
  validate(updateSettingsSchema),
  dashboardController.updateSettings
);

export default router;
