/**
 * Newsletter Subscriber Model
 * ----------------------------
 * Stores email subscribers for newsletter campaigns.
 * Supports subscribe/unsubscribe with tracking.
 *
 * Indexes: email (unique), isSubscribed
 */

import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    isSubscribed: {
      type: Boolean,
      default: true,
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    unsubscribedAt: {
      type: Date,
    },

    // Source of subscription (footer, popup, checkout, etc.)
    source: {
      type: String,
      trim: true,
      default: 'website',
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
newsletterSubscriberSchema.index({ email: 1 });
newsletterSubscriberSchema.index({ isSubscribed: 1 });

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);

export default NewsletterSubscriber;
