/**
 * Coupon Routes
 * -------------
 */

import { Router } from 'express';
import couponController from './coupon.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { USER_ROLES } from '../../utils/constants.js';

import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
  idParamSchema,
} from './coupon.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ──────────────────────────────────────────
// User Routes
// ──────────────────────────────────────────

router.post(
  '/apply',
  validate(applyCouponSchema),
  couponController.applyCoupon
);

router.delete('/remove', couponController.removeCoupon);

// ──────────────────────────────────────────
// Admin Routes
// ──────────────────────────────────────────

router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

router.post(
  '/',
  validate(createCouponSchema),
  couponController.createCoupon
);

router.get('/', couponController.getAllCoupons);

router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  couponController.deleteCoupon
);

export default router;
