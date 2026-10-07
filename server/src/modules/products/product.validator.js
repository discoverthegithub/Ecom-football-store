/**
 * Product Validators (Zod Schemas)
 * ---------------------------------
 */

import { z } from 'zod';

const optionalMongoId = z.preprocess(
  (val) => (!val || val === '' || val === 'null' || val === 'undefined' ? undefined : val),
  z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format').optional()
);

const optionalString = z.preprocess(
  (val) => (val === '' || val === 'null' || val === 'undefined' ? undefined : String(val)),
  z.string().optional()
);

const createProductSchema = z.object({
  name: z.string({ required_error: 'Product name is required' }).trim().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string({ required_error: 'Description is required' }).trim().min(5, 'Description must be at least 5 characters'),
  shortDescription: optionalString,
  brand: optionalString,
  price: z.preprocess((val) => (val && val !== '' ? Number(val) : 99.99), z.number().min(0).optional()),
  comparePrice: z.preprocess((val) => (val && val !== '' ? Number(val) : 0), z.number().min(0).optional()),
  gender: optionalString,
  team: optionalString,
  league: optionalString,
  league_or_type: optionalString,
  season: optionalString,
  isVintage: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  status: optionalString,
  category: z.preprocess(
    (val) => (!val || val === '' ? undefined : String(val)),
    z.string({ required_error: 'Category is required' }).min(1, 'Category is required')
  ),
  subcategory: optionalMongoId,
  tags: z.preprocess((val) => {
    if (typeof val === 'string') {
      if (!val.trim()) return [];
      try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()); }
    }
    return val;
  }, z.array(z.string()).optional()),
  isActive: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

const createVariantSchema = z.object({
  product: optionalMongoId,
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters'),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Price cannot be negative')),
  compareAtPrice: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(0).optional()),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0, 'Stock cannot be negative')),
  weight: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  dimensions: z.preprocess((val) => {
    if (typeof val === 'string') { try { return JSON.parse(val); } catch { return val; } }
    return val;
  }, z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
  }).optional()),
  attributes: z.preprocess((val) => {
    if (typeof val === 'string') { try { return JSON.parse(val); } catch { return val; } }
    return val;
  }, z.object({
    color: z.string().optional(),
    size: z.string().optional(),
    material: z.string().optional(),
    style: z.string().optional(),
  }).optional()),
  isActive: z.boolean().optional(),
});

const updateVariantSchema = createVariantSchema.partial();

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

export {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  idParamSchema,
};
