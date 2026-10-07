/**
 * Wishlist Repository
 * -------------------
 */

import Wishlist from './wishlist.model.js';

class WishlistRepository {
  async findWishlistByUser(userId) {
    return Wishlist.findOne({ user: userId }).populate('products', 'name slug images brand averageRating isActive');
  }

  async createWishlist(userId) {
    return Wishlist.create({ user: userId, products: [] });
  }

  async updateWishlist(wishlistId, productsArray) {
    return Wishlist.findByIdAndUpdate(
      wishlistId,
      { products: productsArray },
      { new: true }
    ).populate('products', 'name slug images brand averageRating isActive');
  }

  async clearWishlist(userId) {
    return Wishlist.findOneAndUpdate(
      { user: userId },
      { products: [] },
      { new: true }
    );
  }
}

export default new WishlistRepository();
