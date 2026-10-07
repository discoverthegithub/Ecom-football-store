/**
 * Payment Model
 * ---------------
 * Records payment transactions linked to orders.
 * Supports Stripe card payments and Cash on Delivery.
 *
 * Indexes: order (ref, unique), stripePaymentId, status
 */

import mongoose from 'mongoose';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '../../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },

    method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: [true, 'Payment method is required'],
    },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },

    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    currency: {
      type: String,
      default: 'usd',
      uppercase: true,
    },

    // Stripe-specific fields
    stripePaymentIntentId: {
      type: String,
      default: '',
    },

    stripeChargeId: {
      type: String,
      default: '',
    },

    // Refund tracking
    refundId: {
      type: String,
      default: '',
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
      default: '',
    },

    refundedAt: {
      type: Date,
    },

    // Transaction metadata
    paidAt: {
      type: Date,
    },

    failureReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
// paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
