/**
 * Product & Variant Routes
 * --------------------------
 */

import { Router } from 'express';
import productController from './product.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { uploadProductImage } from '../../middlewares/upload.middleware.js';
import { cacheRoute } from '../../middlewares/cache.middleware.js';
import { parseFormData } from '../../middlewares/formDataParser.middleware.js';
import { USER_ROLES } from '../../utils/constants.js';

import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  idParamSchema,
} from './product.validator.js';

const router = Router();

// Optional Auth for GET requests to allow admins to see inactive products
import { verifyAccessToken } from '../../utils/tokenHelper.js';
import User from '../users/user.model.js';

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore error
  }
  next();
};

// ──────────────────────────────────────────
// Public Routes
// ──────────────────────────────────────────

router.get('/', optionalAuth, cacheRoute('products', 600), productController.getProducts);
router.get('/slug/:slug', optionalAuth, cacheRoute('products', 600), productController.getProductBySlug);
router.get('/:id', validate(idParamSchema, 'params'), optionalAuth, cacheRoute('products', 600), productController.getProductById);

// ──────────────────────────────────────────
// Protected Admin Routes
// ──────────────────────────────────────────

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

// Products
router.post(
  '/',
  uploadProductImage.array('images', 5), // Max 5 images per product
  parseFormData,
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  '/:id',
  uploadProductImage.array('images', 5),
  parseFormData,
  validate(idParamSchema, 'params'),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  productController.deleteProduct
);

// Variants
router.post(
  '/variants',
  uploadProductImage.single('image'),
  parseFormData,
  validate(createVariantSchema),
  productController.createVariant
);

router.put(
  '/variants/:id',
  uploadProductImage.single('image'),
  parseFormData,
  validate(idParamSchema, 'params'),
  validate(updateVariantSchema),
  productController.updateVariant
);

router.delete(
  '/variants/:id',
  validate(idParamSchema, 'params'),
  productController.deleteVariant
);

export default router;
