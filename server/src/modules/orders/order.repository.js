/**
 * Order Repository
 * -----------------
 */

import Order from './order.model.js';

class OrderRepository {
  async createOrder(orderData, session = null) {
    // If a transaction session is provided, use it
    if (session) {
      const orders = await Order.create([orderData], { session });
      return orders[0];
    }
    return Order.create(orderData);
  }

  async findOrderById(orderId) {
    return Order.findById(orderId)
      .populate('user', 'firstName lastName email')
      .populate('shippingAddress')
      .populate('billingAddress')
      .populate('items.product', 'name slug brand images')
      .populate('items.variant', 'sku attributes');
  }

  async findOrdersByUser(userId, skip = 0, limit = 10) {
    return Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images');
  }

  async countOrdersByUser(userId) {
    return Order.countDocuments({ user: userId });
  }

  async findAllOrders(filter = {}, skip = 0, limit = 10, sort = '-createdAt') {
    return Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email');
  }

  async countAllOrders(filter = {}) {
    return Order.countDocuments(filter);
  }

  async updateOrder(orderId, updateData) {
    return Order.findByIdAndUpdate(orderId, updateData, { new: true, runValidators: true });
  }
}

export default new OrderRepository();
