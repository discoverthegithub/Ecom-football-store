/**
 * Review Routes
 * ---------------
 */

import { Router } from 'express';
import reviewController from './review.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import { z } from 'zod';

import {
  createReviewSchema,
  updateReviewSchema,
  idParamSchema,
} from './review.validator.js';

const router = Router();

const productIdParamSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
});

// Public: Get reviews for a product
router.get(
  '/product/:productId',
  validate(productIdParamSchema, 'params'),
  reviewController.getProductReviews
);

// Protected routes
router.use(authenticate);

router.post(
  '/',
  validate(createReviewSchema),
  reviewController.addReview
);

router.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  reviewController.deleteReview
);

export default router;
