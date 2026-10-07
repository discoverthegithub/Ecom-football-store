/**
 * Payment Routes
 * ----------------
 */

import { Router } from 'express';
import paymentController from './payment.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const orderIdParamSchema = z.object({
  orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
});

// ──────────────────────────────────────────
// Public Routes
// ──────────────────────────────────────────

// Webhook route MUST be raw for Stripe signature verification.
// We configure `express.raw` here to parse the body before the global `express.json` gets to it
// (Note: This actually requires the route to be registered in app.js BEFORE express.json(), 
// but we'll export it separately or handle it in app.js).
// Alternatively, since we use `app.use(express.json())` globally in app.js, this local middleware won't work
// unless we change app.js. We will handle the webhook route specifically in app.js.

// ──────────────────────────────────────────
// Protected Routes
// ──────────────────────────────────────────

// Create Payment Intent for an order
router.post(
  '/intent/:orderId',
  authenticate,
  validate(orderIdParamSchema, 'params'),
  paymentController.createIntent
);

export default router;
