/**
 * Wishlist Model
 * ---------------
 * Stores user's wishlisted products.
 * Each user has one wishlist document with an array of product references.
 *
 * Indexes: user (unique)
 */

import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
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
// wishlistSchema.index({ user: 1 });

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Number of items in the wishlist
wishlistSchema.virtual('itemCount').get(function () {
  return this.products.length;
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
