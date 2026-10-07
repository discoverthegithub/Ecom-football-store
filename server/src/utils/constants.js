/**
 * Application Constants
 * ---------------------
 * Centralized location for all magic strings, enums, and fixed values.
 * Import from here instead of hardcoding values throughout the app.
 */

/** User roles for RBAC */
export const USER_ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
});
export const ROLES = USER_ROLES;

/** Order statuses */
export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
});
export const ORDER_STATUSES = ORDER_STATUS; // Alias for backward compatibility

/** Payment statuses */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});
export const PAYMENT_STATUSES = PAYMENT_STATUS; // Alias for backward compatibility

/** Payment methods */
export const PAYMENT_METHODS = Object.freeze({
  STRIPE: 'stripe',
  CREDIT_CARD: 'credit_card',
  COD: 'cod',
});

/** Product statuses */
export const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  OUT_OF_STOCK: 'out_of_stock',
});

/** Coupon types */
export const COUPON_TYPES = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
});

/** Gender categories */
export const GENDER_CATEGORIES = Object.freeze({
  MEN: 'men',
  WOMEN: 'women',
  UNISEX: 'unisex',
});

/** Common sizes */
export const SIZES = Object.freeze(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);

/** Pagination defaults */
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
});

/** Sort directions */
export const SORT_ORDER = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
});

/** Cache TTL in seconds */
export const CACHE_TTL = Object.freeze({
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
});

/** File upload limits */
export const UPLOAD = Object.freeze({
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
});

/** HTTP Status Codes (commonly used) */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});
