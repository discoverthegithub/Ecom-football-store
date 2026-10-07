/**
 * Cart Repository
 * -----------------
 */

import Cart from './cart.model.js';

class CartRepository {
  async getCartByUserId(userId) {
    return Cart.findOne({ user: userId })
      .populate({
        path: 'items.product',
        select: 'name slug images brand isActive',
      })
      .populate({
        path: 'items.variant',
        select: 'sku price compareAtPrice stock attributes image isActive',
      });
  }

  async createCart(cartData) {
    return Cart.create(cartData);
  }

  async updateCart(userId, updateData) {
    return Cart.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'items.product',
        select: 'name slug images brand isActive',
      })
      .populate({
        path: 'items.variant',
        select: 'sku price compareAtPrice stock attributes image isActive',
      });
  }

  async clearCart(userId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { items: [], coupon: null, discountAmount: 0 },
      { new: true }
    );
  }
}

export default new CartRepository();
