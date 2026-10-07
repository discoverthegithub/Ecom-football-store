/**
 * Coupon Model
 * --------------
 * Discount coupons with type (percentage/fixed), usage limits,
 * expiry dates, and minimum purchase requirements.
 *
 * Indexes: code (unique), isActive, expiresAt
 */

import mongoose from 'mongoose';
import { COUPON_TYPES } from '../../utils/constants.js';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },

    type: {
      type: String,
      enum: Object.values(COUPON_TYPES),
      required: [true, 'Coupon type is required'],
    },

    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: [0, 'Value cannot be negative'],
    },

    // Constraints
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative'],
    },

    maxDiscount: {
      type: Number,
      default: null, // null = no cap
      min: [0, 'Max discount cannot be negative'],
    },

    // Usage limits
    maxUses: {
      type: Number,
      default: null, // null = unlimited
      min: [1, 'Max uses must be at least 1'],
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxUsesPerUser: {
      type: Number,
      default: 1,
      min: [1, 'Max uses per user must be at least 1'],
    },

    // Track which users have used this coupon
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Validity
    startDate: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Applicable categories (empty = all categories)
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
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
couponSchema.index({ isActive: 1, expiresAt: 1 });

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Whether the coupon is currently valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();
  const hasUsesLeft = this.maxUses === null || this.usedCount < this.maxUses;
  return this.isActive && this.startDate <= now && this.expiresAt > now && hasUsesLeft;
});

// Whether the coupon has expired
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
