/**
 * Wishlist Controller
 * -------------------
 */

import wishlistService from './wishlist.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class WishlistController {
  getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user._id);
    ApiResponse.ok(res, wishlist, 'Wishlist fetched successfully');
  });

  toggleProduct = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.toggleProduct(req.user._id, req.body.product);
    ApiResponse.ok(res, wishlist, 'Wishlist updated successfully');
  });

  clearWishlist = asyncHandler(async (req, res) => {
    await wishlistService.clearWishlist(req.user._id);
    ApiResponse.ok(res, null, 'Wishlist cleared successfully');
  });
}

export default new WishlistController();
