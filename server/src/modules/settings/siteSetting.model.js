/**
 * Site Settings Model
 * --------------------
 * Dynamic key-value store for site-wide settings.
 * Used for banners, shipping rates, tax rates, social links, etc.
 *
 * Examples:
 *   { key: 'shipping_rate_standard', value: '5.99', type: 'number', group: 'shipping' }
 *   { key: 'hero_banner_url', value: 'https://...', type: 'string', group: 'home' }
 *
 * Indexes: key (unique), group
 */

import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required'],
    },

    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'json', 'array'],
      default: 'string',
    },

    group: {
      type: String,
      trim: true,
      default: 'general',
    },

    label: {
      type: String,
      trim: true,
      default: '',
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    isEditable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
siteSettingSchema.index({ key: 1 });
siteSettingSchema.index({ group: 1 });

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);

export default SiteSetting;
