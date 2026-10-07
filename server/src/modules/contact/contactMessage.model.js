/**
 * Contact Message Model
 * ----------------------
 * Stores messages submitted via the contact form.
 * Admin can mark messages as read and respond.
 *
 * Indexes: isRead, createdAt
 */

import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
      default: '',
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },

    adminReply: {
      type: String,
      trim: true,
      default: '',
    },

    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
contactMessageSchema.index({ isRead: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
