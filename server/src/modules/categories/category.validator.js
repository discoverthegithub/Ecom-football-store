/**
 * Category & Subcategory Validators (Zod Schemas)
 * ------------------------------------------------
 */

import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  description: z.string().trim().max(200).optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

const createSubcategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID'),
  description: z.string().trim().max(200).optional(),
  isActive: z.boolean().optional(),
});

const updateSubcategorySchema = createSubcategorySchema.partial();

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export {
  createCategorySchema,
  updateCategorySchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  idParamSchema,
};
