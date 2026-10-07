/**
 * Order Routes
 * -------------
 */

import { Router } from 'express';
import orderController from './order.controller.js';
import validate from '../../middlewares/validate.middleware.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/authorize.middleware.js';
import { USER_ROLES } from '../../utils/constants.js';

import {
  placeOrderSchema,
  updateOrderStatusSchema,
  idParamSchema,
} from './order.validator.js';

const router = Router();

// All order operations require authentication
router.use(authenticate);

// ──────────────────────────────────────────
// User Routes
// ──────────────────────────────────────────

// Place an order (checkout)
router.post(
  '/',
  validate(placeOrderSchema),
  orderController.placeOrder
);

// Get my orders
router.get('/my-orders', orderController.getMyOrders);

// Get specific order details (checks ownership in service)
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  orderController.getOrderById
);

// ──────────────────────────────────────────
// Admin Routes
// ──────────────────────────────────────────

router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN));

// Get all orders (paginated, sortable)
router.get('/', orderController.getAllOrders);

// Update order status (e.g. processing -> shipped)
router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
