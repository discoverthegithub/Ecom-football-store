/**
 * Category Model
 * ---------------
 * Top-level product categories (e.g., Shirts, Pants, Jackets).
 * Each category can have multiple subcategories.
 *
 * Indexes: slug (unique), isActive
 */

import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [100, 'Category name cannot exceed 100 characters'],
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
categorySchema.index({ isActive: 1, sortOrder: 1 });

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Virtual populate — category's subcategories
categorySchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: '_id',
  foreignField: 'category',
});

// Virtual populate — category's products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
});

// ──────────────────────────────────────────
// Pre-save Hook — Auto-generate slug
// ──────────────────────────────────────────
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
