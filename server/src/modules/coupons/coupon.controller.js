/**
 * Coupon Controller
 * -----------------
 */

import couponService from './coupon.service.js';
import cartService from '../cart/cart.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class CouponController {
  // ──────────────────────────────────────────
  // Admin Endpoints
  // ──────────────────────────────────────────

  createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    ApiResponse.created(res, coupon, 'Coupon created successfully');
  });

  getAllCoupons = asyncHandler(async (req, res) => {
    const result = await couponService.getAllCoupons(req.query);
    ApiResponse.ok(res, result, 'Coupons fetched successfully');
  });

  updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    ApiResponse.ok(res, coupon, 'Coupon updated successfully');
  });

  deleteCoupon = asyncHandler(async (req, res) => {
    await couponService.deleteCoupon(req.params.id);
    ApiResponse.ok(res, null, 'Coupon deleted successfully');
  });

  // ──────────────────────────────────────────
  // User Endpoints
  // ──────────────────────────────────────────

  applyCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    // We defer to cartService to apply the discount to the actual user's cart
    const cart = await cartService.applyCoupon(req.user._id, code);
    ApiResponse.ok(res, cart, 'Coupon applied successfully');
  });

  removeCoupon = asyncHandler(async (req, res) => {
    const cart = await cartService.removeCoupon(req.user._id);
    ApiResponse.ok(res, cart, 'Coupon removed successfully');
  });
}

export default new CouponController();
