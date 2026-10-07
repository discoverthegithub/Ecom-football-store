/**
 * Category & Subcategory Routes
 * -------------------------------
 */

import { Router } from 'express';
import categoryController from './category.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { uploadProductImage } from '../../middlewares/upload.middleware.js';
import { parseFormData } from '../../middlewares/formDataParser.middleware.js';
import { USER_ROLES } from '../../utils/constants.js';

import {
  createCategorySchema,
  updateCategorySchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  idParamSchema,
} from './category.validator.js';

const router = Router();

// Allow reading categories/subcategories publicly
// Actually, standard practice: we don't protect GET routes, controller checks if user exists

import { verifyAccessToken } from '../../utils/tokenHelper.js';
import User from '../users/user.model.js';
import { cacheRoute } from '../../middlewares/cache.middleware.js';

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
    // Ignore error, just proceed as unauthenticated
  }
  next();
};

// ──────────────────────────────────────────
// Public Routes
// ──────────────────────────────────────────

router.get('/subcategories', optionalAuth, cacheRoute('categories', 86400), categoryController.getAllSubcategories);
router.get('/subcategories/:id', validate(idParamSchema, 'params'), cacheRoute('categories', 86400), categoryController.getSubcategoryById);

router.get('/', optionalAuth, cacheRoute('categories', 86400), categoryController.getAllCategories);
router.get('/:id', validate(idParamSchema, 'params'), cacheRoute('categories', 86400), categoryController.getCategoryById);
router.get('/:id/subcategories', validate(idParamSchema, 'params'), optionalAuth, cacheRoute('categories', 86400), categoryController.getSubcategoriesByCategory);

// ──────────────────────────────────────────
// Protected Admin Routes
// ──────────────────────────────────────────

router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

// Categories
router.post(
  '/',
  uploadProductImage.single('image'),
  parseFormData,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  '/:id',
  uploadProductImage.single('image'),
  parseFormData,
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  categoryController.deleteCategory
);

// Subcategories
router.post(
  '/subcategories',
  validate(createSubcategorySchema),
  categoryController.createSubcategory
);

router.put(
  '/subcategories/:id',
  validate(idParamSchema, 'params'),
  validate(updateSubcategorySchema),
  categoryController.updateSubcategory
);

router.delete(
  '/subcategories/:id',
  validate(idParamSchema, 'params'),
  categoryController.deleteSubcategory
);

export default router;
