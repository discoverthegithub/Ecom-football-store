/**
 * Activity Log Model
 * --------------------
 * Audit trail for important actions in the system.
 * Tracks who did what, when, from where, and on which resource.
 *
 * Examples:
 *   - User logged in
 *   - Admin created a product
 *   - Order status changed to "shipped"
 *   - Coupon was deleted
 *
 * Indexes: user, action, resource, createdAt
 */

import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system-generated events
    },

    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      enum: [
        'login',
        'logout',
        'register',
        'password_change',
        'password_reset',
        'profile_update',
        'create',
        'update',
        'delete',
        'status_change',
        'payment',
        'refund',
        'export',
        'import',
        'email_sent',
        'setting_change',
        'other',
      ],
    },

    resource: {
      type: String,
      required: [true, 'Resource type is required'],
      trim: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // Snapshot of changed data (for audit purposes)
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Request context
    ip: {
      type: String,
      default: '',
    },

    userAgent: {
      type: String,
      default: '',
    },

    // Severity for filtering
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
  },
  {
    timestamps: true,
  }
);

// ──────────────────────────────────────────
// Indexes
// ──────────────────────────────────────────
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, resourceId: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ severity: 1 });

// TTL index — auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
