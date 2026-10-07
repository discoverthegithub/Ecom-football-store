/**
 * Review Validators (Zod Schemas)
 * --------------------------------
 */

import { z } from 'zod';

const createReviewSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters').optional(),
  comment: z.string().trim().max(1000, 'Comment cannot exceed 1000 characters').optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().max(1000).optional(),
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export {
  createReviewSchema,
  updateReviewSchema,
  idParamSchema,
};
