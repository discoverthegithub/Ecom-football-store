/**
 * Coupon Validators
 * -----------------
 */

import { z } from 'zod';
import { COUPON_TYPES } from '../../utils/constants.js';

const createCouponSchema = z.object({
  code: z.string().trim().min(3, 'Code must be at least 3 characters').max(20).toUpperCase(),
  type: z.enum(Object.values(COUPON_TYPES), {
    required_error: 'Discount type is required',
    invalid_type_error: 'Invalid discount type',
  }),
  value: z.number().min(0, 'Discount value cannot be negative'),
  minPurchaseAmount: z.number().min(0).default(0),
  startDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {return new Date(arg);}
  }, z.date()),
  endDate: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) {return new Date(arg);}
  }, z.date()),
  usageLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

const updateCouponSchema = createCouponSchema.partial();

const applyCouponSchema = z.object({
  code: z.string().trim().toUpperCase(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
  idParamSchema,
};
