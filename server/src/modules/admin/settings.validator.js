/**
 * Admin Dashboard & Settings Validators
 * --------------------------------------
 */

import { z } from 'zod';

const updateSettingsSchema = z.object({
  siteName: z.string().trim().min(2, 'Site name must be at least 2 characters').max(100),
  supportEmail: z.string().email('Invalid email address'),
  supportPhone: z.string().trim().max(20).optional(),
  currency: z.string().trim().length(3).toUpperCase().default('USD'),
  taxRate: z.number().min(0).max(100).default(0),
  freeShippingThreshold: z.number().min(0).default(0),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

export {
  updateSettingsSchema,
};
