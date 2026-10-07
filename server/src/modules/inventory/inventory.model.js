/**
 * Inventory Model
 * -----------------
 * Tracks inventory movements (additions, deductions, adjustments)
 * for product variants. Provides a historical audit trail of stock changes.
 *
 * The actual stock count lives on ProductVariant.stock.
 * This model logs WHY stock changed (order, restock, adjustment, return, etc.)
 *
 * Indexes: variant (ref), type, createdAt
 */

import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: [true, 'Product variant is required'],
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },

    type: {
      type: String,
      enum: ['addition', 'deduction', 'adjustment', 'return', 'reservation', 'release'],
      required: [true, 'Inventory movement type is required'],
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },

    // Stock after this movement
    stockAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: [300, 'Reason cannot exceed 300 characters'],
      default: '',
    },

    // Reference to the order (if movement is order-related)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },

    // Who performed the action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
inventorySchema.index({ variant: 1, createdAt: -1 });
inventorySchema.index({ product: 1, createdAt: -1 });
inventorySchema.index({ type: 1, createdAt: -1 });
inventorySchema.index({ order: 1 }, { sparse: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
