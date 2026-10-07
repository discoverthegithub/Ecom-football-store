/**
 * Product Variant Model
 * ----------------------
 * Represents a specific SKU of a product (size + color combination).
 * Example: "Classic Oxford Shirt" → Variant: "Blue / Large"
 *
 * Each variant tracks its own stock, price override, and SKU.
 * Indexes: product (ref), sku (unique), color + size compound
 */

import mongoose from 'mongoose';
import { SIZES } from '../../utils/constants.js';

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    color: {
      name: {
        type: String,
        required: [true, 'Color name is required'],
        trim: true,
      },
      hexCode: {
        type: String,
        trim: true,
        match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code'],
        default: '#000000',
      },
    },

    size: {
      type: String,
      required: [true, 'Size is required'],
      enum: {
        values: SIZES,
        message: `Size must be one of: ${SIZES.join(', ')}`,
      },
    },

    // Price override (if different from base product price)
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: null, // null means use base product price
    },

    // Stock management
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    reservedStock: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative'],
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },

    // Variant-specific image (optional)
    image: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },

    isActive: {
      type: Boolean,
      default: true,
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
productVariantSchema.index({ product: 1, isActive: 1 });

// Compound unique: same product cannot have duplicate color+size combinations
productVariantSchema.index(
  { product: 1, 'color.name': 1, size: 1 },
  { unique: true }
);

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Available stock (total stock minus reserved)
productVariantSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

// Whether the variant is in stock
productVariantSchema.virtual('inStock').get(function () {
  return this.stock - this.reservedStock > 0;
});

// Whether stock is running low
productVariantSchema.virtual('isLowStock').get(function () {
  return this.stock - this.reservedStock <= this.lowStockThreshold && this.stock > 0;
});

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
