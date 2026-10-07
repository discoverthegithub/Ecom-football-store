/**
 * Wishlist Service
 * ----------------
 */

import wishlistRepository from './wishlist.repository.js';
import productRepository from '../products/product.repository.js';
import ApiError from '../../utils/ApiError.js';

class WishlistService {
  async getWishlist(userId) {
    let wishlist = await wishlistRepository.findWishlistByUser(userId);
    if (!wishlist) {
      wishlist = await wishlistRepository.createWishlist(userId);
    }
    return wishlist;
  }

  async toggleProduct(userId, productId) {
    const product = await productRepository.findProductById(productId);
    if (!product || !product.isActive) {
      throw ApiError.notFound('Product not found or unavailable');
    }

    let wishlist = await wishlistRepository.findWishlistByUser(userId);
    if (!wishlist) {
      wishlist = await wishlistRepository.createWishlist(userId);
    }

    // Convert ObjectIds to string for comparison
    const productList = wishlist.products.map(p => p._id.toString() || p.toString());
    const productIndex = productList.indexOf(productId.toString());

    if (productIndex > -1) {
      // Product is in wishlist, so remove it
      productList.splice(productIndex, 1);
    } else {
      // Product is not in wishlist, so add it
      productList.push(productId);
    }

    return wishlistRepository.updateWishlist(wishlist._id, productList);
  }

  async clearWishlist(userId) {
    return wishlistRepository.clearWishlist(userId);
  }
}

export default new WishlistService();
