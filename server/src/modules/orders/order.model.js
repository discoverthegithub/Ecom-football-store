/**
 * Order Model
 * -------------
 * Represents a customer's order with shipping, billing, payment, and status tracking.
 * Contains embedded order items for denormalized read performance.
 *
 * Indexes: user, status, orderNumber (unique), createdAt
 */

import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS } from '../../utils/constants.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: true,
    },

    // Snapshot fields — preserve data at time of order
    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: '',
    },

    color: {
      type: String,
      required: true,
    },

    size: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    // Addresses (snapshot — not refs, to preserve historical data)
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    billingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    // Pricing breakdown
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Coupon (if applied)
    coupon: {
      code: { type: String, default: '' },
      discount: { type: Number, default: 0 },
    },

    // Payment
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: [true, 'Payment method is required'],
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    // Status tracking
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(ORDER_STATUS),
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],

    // Shipping
    shippingMethod: {
      type: String,
      default: 'standard',
    },

    trackingNumber: {
      type: String,
      default: '',
    },

    estimatedDelivery: {
      type: Date,
    },

    deliveredAt: {
      type: Date,
    },

    // Return/Cancel
    cancelReason: {
      type: String,
      default: '',
    },

    returnReason: {
      type: String,
      default: '',
    },

    returnStatus: {
      type: String,
      enum: ['', 'requested', 'approved', 'rejected', 'completed'],
      default: '',
    },

    // Notes
    customerNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Virtual populate — payment record
orderSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'order',
  justOne: true,
});

// Total number of items in the order
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ──────────────────────────────────────────
// Pre-save Hook — Add initial status to history
// ──────────────────────────────────────────
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      note: 'Order placed',
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
