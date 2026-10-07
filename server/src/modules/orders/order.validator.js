/**
 * Order Validators (Zod Schemas)
 * -------------------------------
 */

import { z } from 'zod';
import { PAYMENT_METHODS, ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants.js';

const placeOrderSchema = z.object({
  shippingAddress: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid shipping address ID'),
  billingAddress: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid billing address ID').optional(),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS), {
    required_error: 'Payment method is required',
    invalid_type_error: 'Invalid payment method',
  }),
  orderNotes: z.string().trim().max(500, 'Order notes cannot exceed 500 characters').optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUSES), {
    required_error: 'Order status is required',
    invalid_type_error: 'Invalid order status',
  }),
});

const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(Object.values(PAYMENT_STATUSES), {
    required_error: 'Payment status is required',
    invalid_type_error: 'Invalid payment status',
  }),
});

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format'),
});

export {
  placeOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  idParamSchema,
};
