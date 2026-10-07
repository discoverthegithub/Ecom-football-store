/**
 * User Validators (Zod Schemas)
 * ------------------------------
 * Defines validation schemas for user profile and address endpoints.
 */

import { z } from 'zod';

/**
 * Update Profile — PATCH /api/v1/users/profile
 */
const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
});

/**
 * Add/Update Address — POST/PUT /api/v1/users/addresses
 */
const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']).optional().default('shipping'),

  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(5, 'Phone number must be at least 5 characters')
    .max(20, 'Phone number cannot exceed 20 characters'),

  street: z
    .string({ required_error: 'Street address is required' })
    .trim()
    .min(1, 'Street address is required')
    .max(200, 'Street cannot exceed 200 characters'),

  apartment: z
    .string()
    .trim()
    .max(50, 'Apartment cannot exceed 50 characters')
    .optional()
    .default(''),

  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City cannot exceed 100 characters'),

  state: z
    .string({ required_error: 'State/Province is required' })
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State cannot exceed 100 characters'),

  zipCode: z
    .string({ required_error: 'ZIP/Postal code is required' })
    .trim()
    .min(3, 'ZIP/Postal code must be at least 3 characters')
    .max(20, 'ZIP/Postal code cannot exceed 20 characters'),

  country: z
    .string({ required_error: 'Country is required' })
    .trim()
    .min(2, 'Country must be at least 2 characters')
    .max(100, 'Country cannot exceed 100 characters'),

  isDefault: z.boolean().optional().default(false),
});

/**
 * Address Params (ID)
 */
const addressParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid address ID'),
});

/**
 * Admin Update User — PATCH /api/v1/users/:id/status
 */
const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive status is required' }),
});

const userParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export {
  updateProfileSchema,
  addressSchema,
  addressParamsSchema,
  updateStatusSchema,
  userParamsSchema,
};
