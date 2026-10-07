/**
 * Wishlist Routes
 * ---------------
 */

import { Router } from 'express';
import wishlistController from './wishlist.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

import {
  toggleWishlistSchema,
} from './wishlist.validator.js';

const router = Router();

// All wishlist operations require authentication
router.use(authenticate);

router.get('/', wishlistController.getWishlist);

router.post(
  '/toggle',
  validate(toggleWishlistSchema),
  wishlistController.toggleProduct
);

router.delete('/', wishlistController.clearWishlist);

export default router;
