/**
 * Address Model
 * ---------------
 * User's saved shipping/billing addresses.
 * Each user can have multiple addresses with one default per type.
 *
 * Indexes: user (ref), type, isDefault
 */

import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    type: {
      type: String,
      enum: ['shipping', 'billing'],
      required: [true, 'Address type is required'],
    },

    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },

    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street cannot exceed 200 characters'],
    },

    apartment: {
      type: String,
      trim: true,
      default: '',
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters'],
    },

    state: {
      type: String,
      required: [true, 'State/Province is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters'],
    },

    zipCode: {
      type: String,
      required: [true, 'ZIP/Postal code is required'],
      trim: true,
      maxlength: [20, 'ZIP code cannot exceed 20 characters'],
    },

    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
addressSchema.index({ user: 1, type: 1 });
addressSchema.index({ user: 1, isDefault: 1 });

// ──────────────────────────────────────────
// Pre-save Hook
// ──────────────────────────────────────────

/**
 * When setting an address as default, unset the previous default
 * of the same type for the same user.
 */
addressSchema.pre('save', async function (next) {
  if (this.isModified('isDefault') && this.isDefault) {
    await this.constructor.updateMany(
      {
        user: this.user,
        type: this.type,
        _id: { $ne: this._id },
      },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
