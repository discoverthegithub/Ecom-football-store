/**
 * Product Model
 * --------------
 * Core product entity for the e-commerce platform.
 * Each product belongs to a category/subcategory and can have multiple variants.
 *
 * Indexes: slug (unique), category, subcategory, status, price, gender
 * Virtuals: variants, reviews, averageRating
 */

import mongoose from 'mongoose';
import slugify from 'slugify';
import { PRODUCT_STATUS, GENDER_CATEGORIES } from '../../utils/constants.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },

    // Pricing
    price: {
      type: Number,
      default: 99.99,
      min: [0, 'Price cannot be negative'],
    },

    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
      default: 0,
    },

    // Categorization
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
    },

    gender: {
      type: String,
      enum: Object.values(GENDER_CATEGORIES),
      default: 'unisex',
      set: (v) => (!v || v === 'undefined' || v === 'null' || !Object.values(GENDER_CATEGORIES).includes(v) ? 'unisex' : v),
    },

    // Images (stored on Cloudinary or Local uploads)
    images: [
      {
        public_id: { type: String, default: () => `img_${Date.now()}_${Math.floor(Math.random() * 1000)}` },
        url: { type: String, default: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800' },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // Product details
    material: {
      type: String,
      trim: true,
      default: '',
    },

    careInstructions: {
      type: String,
      trim: true,
      default: '',
    },

    tags: {
      type: [String],
      default: [],
    },

    // Football Apparel & Kit Specific Fields
    team: {
      type: String,
      trim: true,
      default: '',
    },

    league_or_type: {
      type: String,
      enum: ['Club', 'Nation', 'Accessory', 'Other'],
      default: 'Club',
    },

    league: {
      type: String,
      trim: true,
      default: '',
    },

    season: {
      type: String,
      trim: true,
      default: '',
    },

    isVintage: {
      type: Boolean,
      default: false,
    },

    stock_sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL'],
    },

    kitImages: {
      front: { type: String, default: '' },
      back: { type: String, default: '' },
      detail: { type: String, default: '' },
    },

    // Flags
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    // SEO
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'Meta title cannot exceed 70 characters'],
      default: '',
    },

    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      default: '',
    },

    // Shipping
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
      default: 0,
    },

    shippingInfo: {
      type: String,
      trim: true,
      default: '',
    },

    returnPolicy: {
      type: String,
      trim: true,
      default: '',
    },

    // Ratings (denormalized for performance)
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10, // Round to 1 decimal
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },

    // Total sold (denormalized for sorting by popularity)
    totalSold: {
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
productSchema.index({ category: 1, status: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ gender: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ ratingsAverage: -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isNewArrival: 1, status: 1 });
productSchema.index({ isBestSeller: 1, status: 1 });
productSchema.index({ tags: 1 });

// Text index for full-text search
productSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, description: 1 } }
);

// ──────────────────────────────────────────
// Virtuals
// ──────────────────────────────────────────

// Virtual populate — product variants
productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product',
});

// Virtual populate — product reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// Discount percentage (if comparePrice > price)
productSchema.virtual('discountPercentage').get(function () {
  if (this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// ──────────────────────────────────────────
// Pre-save Hook — Auto-generate slug
// ──────────────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
