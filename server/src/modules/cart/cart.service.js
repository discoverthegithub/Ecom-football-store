/**
 * Cart Service
 * --------------
 * Business logic for adding/removing items, validating stock,
 * and calculating cart totals.
 */

import cartRepository from './cart.repository.js';
import productRepository from '../products/product.repository.js';
import couponService from '../coupons/coupon.service.js';
import ApiError from '../../utils/ApiError.js';

class CartService {
  /**
   * Helper function to calculate totals for a cart.
   * Modifies the cart object in place.
   */
  _calculateTotals(cart) {
    let subtotal = 0;
    
    // Ensure we are working with populated variant data
    cart.items.forEach(item => {
      // If variant is populated, use its price, else fallback to raw value (which is bad, but safe)
      const price = item.variant?.price || item.price || 0;
      item.price = price; // sync current price
      subtotal += price * item.quantity;
    });

    cart.subtotal = subtotal;
    
    // Total is calculated but if a coupon is already applied, we must wait for applyCoupon to recalculate properly
    // or we can calculate it here safely if we don't have coupon details populated.
    cart.total = Math.max(0, subtotal - (cart.discountAmount || 0));
    
    return cart;
  }
  
  async _revalidateCoupon(cart) {
    if (cart.coupon) {
      try {
        const { discountAmount } = await couponService.validateAndCalculateDiscount(cart.coupon, cart.subtotal);
        cart.discountAmount = discountAmount;
      } catch (error) {
        // Coupon became invalid (expired, min purchase not met, etc)
        cart.coupon = null;
        cart.discountAmount = 0;
      }
      cart.total = Math.max(0, cart.subtotal - cart.discountAmount);
    }
    return cart;
  }

  async getCart(userId) {
    let cart = await cartRepository.getCartByUserId(userId);
    
    if (!cart) {
      cart = await cartRepository.createCart({ user: userId, items: [] });
    } else {
      // Recalculate totals in case prices changed
      cart = this._calculateTotals(cart);
      cart = await this._revalidateCoupon(cart);
      await cart.save();
    }
    
    return cart;
  }

  async addItem(userId, { product, variant, quantity }) {
    // 1. Verify or auto-resolve variant
    let variantDoc = null;
    if (variant) {
      variantDoc = await productRepository.findVariantById(variant);
    }
    if (!variantDoc) {
      const variants = await productRepository.findVariantsByProduct(product, false);
      variantDoc = variants.find(v => v.isActive) || variants[0];
    }
    if (!variantDoc || !variantDoc.isActive) {
      throw ApiError.badRequest('This product variant is currently unavailable.');
    }
    variant = variantDoc._id.toString();

    // 2. Verify stock
    if (variantDoc.stock < quantity) {
      throw ApiError.badRequest(`Only ${variantDoc.stock} items in stock.`);
    }

    // 3. Get or create cart
    let cart = await cartRepository.getCartByUserId(userId);
    if (!cart) {
      cart = await cartRepository.createCart({ user: userId, items: [] });
    }

    // 4. Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.variant._id?.toString() === variant || item.variant.toString() === variant
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (variantDoc.stock < newQuantity) {
        throw ApiError.badRequest(`Cannot add more. Only ${variantDoc.stock} items in stock.`);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = variantDoc.price; // Sync price
    } else {
      // Add new item
      cart.items.push({
        product,
        variant,
        quantity,
        price: variantDoc.price,
      });
    }

    // 5. Save and return populated cart
    cart = this._calculateTotals(cart);
    cart = await this._revalidateCoupon(cart);
    await cart.save();
    
    // Re-fetch to ensure populate is applied to newly added items
    return cartRepository.getCartByUserId(userId);
  }

  async updateItemQuantity(userId, variantId, quantity) {
    let cart = await cartRepository.getCartByUserId(userId);
    if (!cart) {throw ApiError.notFound('Cart not found');}

    const itemIndex = cart.items.findIndex(
      (item) => item.variant._id?.toString() === variantId
    );

    if (itemIndex === -1) {
      throw ApiError.notFound('Item not found in cart');
    }

    // Verify stock
    const variantDoc = await productRepository.findVariantById(variantId);
    if (!variantDoc || !variantDoc.isActive) {
      throw ApiError.badRequest('This product variant is currently unavailable.');
    }

    if (variantDoc.stock < quantity) {
      throw ApiError.badRequest(`Only ${variantDoc.stock} items in stock.`);
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = variantDoc.price; // sync price

    this._calculateTotals(cart);
    cart = await this._revalidateCoupon(cart);
    await cart.save();

    return cart;
  }

  async removeItem(userId, variantId) {
    let cart = await cartRepository.getCartByUserId(userId);
    if (!cart) {throw ApiError.notFound('Cart not found');}

    cart.items = cart.items.filter(
      (item) => item.variant._id?.toString() !== variantId
    );

    this._calculateTotals(cart);
    cart = await this._revalidateCoupon(cart);
    await cart.save();

    return cart;
  }

  async clearCart(userId) {
    return cartRepository.clearCart(userId);
  }

  async applyCoupon(userId, code) {
    let cart = await cartRepository.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    cart = this._calculateTotals(cart);
    
    // Validate coupon and calculate discount based on subtotal
    const { discountAmount } = await couponService.validateAndCalculateDiscount(code, cart.subtotal);

    cart.coupon = code.toUpperCase();
    cart.discountAmount = discountAmount;
    cart.total = Math.max(0, cart.subtotal - cart.discountAmount);

    await cart.save();
    return cart;
  }

  async removeCoupon(userId) {
    let cart = await cartRepository.getCartByUserId(userId);
    if (!cart) {
      throw ApiError.notFound('Cart not found');
    } cart.coupon = null;
    cart.discountAmount = 0;
    
    cart = this._calculateTotals(cart);
    await cart.save();
    
    return cart;
  }
}

export default new CartService();
