/**
 * Coupon Repository
 * -----------------
 */

import Coupon from './coupon.model.js';

class CouponRepository {
  async createCoupon(data) {
    return Coupon.create(data);
  }

  async findCouponById(id) {
    return Coupon.findById(id);
  }

  async findCouponByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase() });
  }

  async findAllCoupons(skip = 0, limit = 10, sort = '-createdAt') {
    return Coupon.find().sort(sort).skip(skip).limit(limit);
  }

  async countCoupons() {
    return Coupon.countDocuments();
  }

  async updateCoupon(id, data) {
    return Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCoupon(id) {
    return Coupon.findByIdAndDelete(id);
  }

  async incrementUsage(code) {
    return Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
  }
}

export default new CouponRepository();
