/**
 * Cart Controller
 * -----------------
 */

import cartService from './cart.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class CartController {
  getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id);
    ApiResponse.ok(res, cart, 'Cart fetched successfully');
  });

  addItem = asyncHandler(async (req, res) => {
    const cart = await cartService.addItem(req.user._id, req.body);
    ApiResponse.ok(res, cart, 'Item added to cart');
  });

  updateItemQuantity = asyncHandler(async (req, res) => {
    const cart = await cartService.updateItemQuantity(
      req.user._id,
      req.params.id, // variant ID
      req.body.quantity
    );
    ApiResponse.ok(res, cart, 'Cart updated successfully');
  });

  removeItem = asyncHandler(async (req, res) => {
    const cart = await cartService.removeItem(req.user._id, req.params.id);
    ApiResponse.ok(res, cart, 'Item removed from cart');
  });

  clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user._id);
    ApiResponse.ok(res, null, 'Cart cleared successfully');
  });
}

export default new CartController();
