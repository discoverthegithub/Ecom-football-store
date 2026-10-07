/**
 * Cart Validators (Zod Schemas)
 * ------------------------------
 */

import { z } from 'zod';

const addItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  variant: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid variant ID').optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const applyCouponSchema = z.object({
  code: z.string().trim().min(3, 'Coupon code must be at least 3 characters'),
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid item/variant ID format'),
});

export {
  addItemSchema,
  updateItemSchema,
  applyCouponSchema,
  idParamSchema,
};
