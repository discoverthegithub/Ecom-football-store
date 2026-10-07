/**
 * Coupon Service
 * --------------
 */

import couponRepository from './coupon.repository.js';
import ApiError from '../../utils/ApiError.js';
import { COUPON_TYPES } from '../../utils/constants.js';

class CouponService {
  // ──────────────────────────────────────────
  // Admin Operations
  // ──────────────────────────────────────────

  async createCoupon(data) {
    const existing = await couponRepository.findCouponByCode(data.code);
    if (existing) {
      throw ApiError.badRequest('Coupon code already exists');
    }
    
    // Validate dates
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw ApiError.badRequest('End date must be after start date');
    }

    if (data.type === COUPON_TYPES.PERCENTAGE && data.value > 100) {
      throw ApiError.badRequest('Percentage discount cannot exceed 100%');
    }

    return couponRepository.createCoupon(data);
  }

  async getAllCoupons(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      couponRepository.findAllCoupons(skip, limit),
      couponRepository.countCoupons(),
    ]);

    return {
      coupons,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async updateCoupon(id, data) {
    if (data.code) {
      const existing = await couponRepository.findCouponByCode(data.code);
      if (existing && existing._id.toString() !== id) {
        throw ApiError.badRequest('Coupon code already exists');
      }
    }

    const coupon = await couponRepository.updateCoupon(id, data);
    if (!coupon) {throw ApiError.notFound('Coupon not found');}
    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await couponRepository.deleteCoupon(id);
    if (!coupon) {throw ApiError.notFound('Coupon not found');}
    return true;
  }

  // ──────────────────────────────────────────
  // User/Cart Operations
  // ──────────────────────────────────────────

  /**
   * Validates a coupon code against a specific subtotal.
   * Returns the calculated discount amount.
   */
  async validateAndCalculateDiscount(code, subtotal) {
    const coupon = await couponRepository.findCouponByCode(code);

    if (!coupon) {
      throw ApiError.notFound('Invalid coupon code');
    }

    if (!coupon.isActive) {
      throw ApiError.badRequest('This coupon is currently inactive');
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw ApiError.badRequest('This coupon is not yet valid');
    }
    if (now > coupon.endDate) {
      throw ApiError.badRequest('This coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('This coupon has reached its usage limit');
    }

    if (subtotal < coupon.minPurchaseAmount) {
      throw ApiError.badRequest(`Minimum purchase of $${coupon.minPurchaseAmount} required for this coupon`);
    }

    let discountAmount = 0;
    if (coupon.type === COUPON_TYPES.PERCENTAGE) {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === COUPON_TYPES.FIXED) {
      discountAmount = coupon.value;
    }

    // Discount cannot exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return { coupon, discountAmount };
  }

  async incrementUsage(code) {
    await couponRepository.incrementUsage(code);
  }
}

export default new CouponService();
