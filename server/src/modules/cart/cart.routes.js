/**
 * Cart Routes
 * -------------
 */

import { Router } from 'express';
import cartController from './cart.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';

import {
  addItemSchema,
  updateItemSchema,
  idParamSchema,
} from './cart.validator.js';

const router = Router();

// All cart operations require authentication
router.use(authenticate);

router.get('/', cartController.getCart);

router.post(
  '/items',
  validate(addItemSchema),
  cartController.addItem
);

router.put(
  '/items/:id',
  validate(idParamSchema, 'params'),
  validate(updateItemSchema),
  cartController.updateItemQuantity
);

router.delete(
  '/items/:id',
  validate(idParamSchema, 'params'),
  cartController.removeItem
);

router.delete('/', cartController.clearCart);

export default router;
