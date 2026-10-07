/**
 * Subcategory Model
 * ------------------
 * Child categories within a parent category.
 * Example: Category "Shirts" → Subcategories: "Casual Shirts", "Formal Shirts", "Polo Shirts"
 *
 * Indexes: slug (unique), category (ref), isActive
 */

import mongoose from 'mongoose';
import slugify from 'slugify';

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      minlength: [2, 'Subcategory name must be at least 2 characters'],
      maxlength: [100, 'Subcategory name cannot exceed 100 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Parent category is required'],
    },

    image: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
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
subcategorySchema.index({ category: 1, isActive: 1 });
subcategorySchema.index({ category: 1, sortOrder: 1 });

// Compound unique: same name cannot exist within the same category
subcategorySchema.index({ name: 1, category: 1 }, { unique: true });

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Virtual populate — subcategory's products
subcategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'subcategory',
});

// ──────────────────────────────────────────
// Pre-save Hook — Auto-generate slug
// ──────────────────────────────────────────
subcategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

export default Subcategory;
