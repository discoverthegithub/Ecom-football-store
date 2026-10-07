/**
 * Cart Model
 * ------------
 * Shopping cart for authenticated users.
 * Each user has one cart (upserted). Items reference product variants.
 *
 * Indexes: user (unique)
 */

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Cannot add more than 10 of the same item'],
    },

    // Price at time of adding to cart (may differ from current price)
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Save for later flag
    savedForLater: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
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
// cartSchema.index({ user: 1 });

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Active items (not saved for later)
cartSchema.virtual('activeItems').get(function () {
  return this.items.filter((item) => !item.savedForLater);
});

// Saved for later items
cartSchema.virtual('savedItems').get(function () {
  return this.items.filter((item) => item.savedForLater);
});

// Total number of active items
cartSchema.virtual('itemCount').get(function () {
  return this.items
    .filter((item) => !item.savedForLater)
    .reduce((sum, item) => sum + item.quantity, 0);
});

// Subtotal of active items
cartSchema.virtual('subtotal').get(function () {
  return this.items
    .filter((item) => !item.savedForLater)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
