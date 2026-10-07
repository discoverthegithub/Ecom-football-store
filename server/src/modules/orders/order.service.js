/**
 * Order Service
 * ---------------
 */

import orderRepository from './order.repository.js';
import cartService from '../cart/cart.service.js';
import productRepository from '../products/product.repository.js';
import userRepository from '../users/user.repository.js';
import couponService from '../coupons/coupon.service.js';
import Inventory from '../inventory/inventory.model.js';
import Payment from '../payments/payment.model.js';
import ApiError from '../../utils/ApiError.js';
import { generateRandomToken } from '../../utils/tokenHelper.js';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../../utils/constants.js';

class OrderService {
  /**
   * Generates a unique, readable order number (e.g., ORD-78A9B-1234)
   */
  _generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-4);
    const randomHex = generateRandomToken().rawToken.slice(0, 5).toUpperCase();
    return `ORD-${randomHex}-${timestamp}`;
  }

  async placeOrder(userId, orderData) {
    // 1. Fetch Cart and verify it's not empty
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty.');
    }

    // 2. Verify Addresses exist and belong to user
    const shippingAddress = await userRepository.findAddressByIdAndUser(orderData.shippingAddress, userId);
    if (!shippingAddress) {
      throw ApiError.badRequest('Invalid shipping address.');
    }

    let billingAddressId = orderData.shippingAddress;
    if (orderData.billingAddress && orderData.billingAddress !== orderData.shippingAddress) {
      const billing = await userRepository.findAddressByIdAndUser(orderData.billingAddress, userId);
      if (!billing) {throw ApiError.badRequest('Invalid billing address.');}
      billingAddressId = billing._id;
    }

    // 3. Double-check stock for all items
    // (cartService._calculateTotals already ensures prices are synced)
    for (const item of cart.items) {
      const variant = await productRepository.findVariantById(item.variant._id);
      if (!variant || !variant.isActive || variant.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for item: ${item.product.name}`);
      }
    }

    // 4. Construct Order Data
    const orderItems = [];
    for (const item of cart.items) {
      const variant = await productRepository.findVariantById(item.variant._id);
      orderItems.push({
        product: item.product._id,
        variant: item.variant._id,
        name: item.product.name,
        image: item.product.images && item.product.images.length > 0 ? item.product.images[0].url : '',
        color: variant.color.name,
        size: variant.size,
        sku: variant.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      });
    }

    const orderNumber = this._generateOrderNumber();
    
    // Calculate shipping and tax (Simplified for now - can be expanded)
    const shippingCost = cart.subtotal > 100 ? 0 : 10; // Free shipping over $100
    const taxRate = 0.08; // 8% tax
    const taxAmount = Number((cart.subtotal * taxRate).toFixed(2));
    const totalAmount = cart.total + shippingCost + taxAmount;

    let billingAddressObj = orderData.shippingAddress === orderData.billingAddress ? shippingAddress : await userRepository.findAddressByIdAndUser(orderData.billingAddress, userId) || shippingAddress;

    const newOrderData = {
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || shippingAddress.name, // Support older schema if needed
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country
      },
      billingAddress: {
        fullName: billingAddressObj.fullName || billingAddressObj.name,
        phone: billingAddressObj.phone,
        street: billingAddressObj.street,
        city: billingAddressObj.city,
        state: billingAddressObj.state,
        zipCode: billingAddressObj.zipCode,
        country: billingAddressObj.country
      },
      subtotal: cart.subtotal,
      shippingCost,
      tax: taxAmount,
      discount: cart.discountAmount || 0,
      total: totalAmount,
      coupon: cart.coupon ? { code: cart.coupon, discount: cart.discountAmount || 0 } : undefined,
      customerNote: orderData.orderNotes || '',
      paymentMethod: orderData.paymentMethod,
    };

    // 5. Create the Order
    const order = await orderRepository.createOrder(newOrderData);

    // 6. Create Initial Payment Record
    await Payment.create({
      order: order._id,
      user: userId,
      amount: totalAmount,
      method: orderData.paymentMethod,
      status: orderData.paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING, // Using PENDING for both initially as UNPAID wasn't in the constants
    });

    // 7. Deduct Inventory and Log Movements
    for (const item of cart.items) {
      const variant = await productRepository.findVariantById(item.variant._id);
      variant.stock -= item.quantity;
      await variant.save();

      // Log movement
      await Inventory.create({
        variant: variant._id,
        product: item.product._id,
        type: 'deduction',
        quantity: item.quantity,
        stockAfter: variant.stock,
        reason: `Order placed: ${orderNumber}`,
        order: order._id,
      });
    }

    // 8. Clear the Cart
    await cartService.clearCart(userId);
    
    // 8b. Increment Coupon Usage if applicable
    if (cart.coupon) {
      await couponService.incrementUsage(cart.coupon);
    }

    // 9. Send Order Confirmation Email (Non-blocking)
    // In a real app, integrate emailHelper here: sendOrderConfirmationEmail(user.email, order)

    return order;
  }

  async getOrderById(orderId, userId, userRole) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {throw ApiError.notFound('Order not found');}

    // Access control: only owner or admin can view
    if (order.user._id.toString() !== userId.toString() && !['admin', 'super_admin'].includes(userRole)) {
      throw ApiError.forbidden('You do not have permission to view this order.');
    }

    return order;
  }

  async getMyOrders(userId, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      orderRepository.findOrdersByUser(userId, skip, limit),
      orderRepository.countOrdersByUser(userId),
    ]);

    return {
      orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async getAllOrders(query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (query.status) {filter.status = query.status;}
    if (query.search) {filter.orderNumber = { $regex: query.search, $options: 'i' };}

    let sort = '-createdAt';
    if (query.sort === 'oldest') {sort = 'createdAt';}

    const [orders, total] = await Promise.all([
      orderRepository.findAllOrders(filter, skip, limit, sort),
      orderRepository.countAllOrders(filter),
    ]);

    return {
      orders,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async updateOrderStatus(orderId, status) {
    const order = await orderRepository.updateOrder(orderId, { status });
    if (!order) {throw ApiError.notFound('Order not found');}

    // Trigger emails based on status (e.g., Shipped)
    // if (status === ORDER_STATUSES.SHIPPED) { ... }

    return order;
  }
}

export default new OrderService();
