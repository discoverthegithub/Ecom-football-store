/**
 * Dashboard & Settings Repository
 * -------------------------------
 */

import User from '../users/user.model.js';
import Order from '../orders/order.model.js';
import ProductVariant from '../products/productVariant.model.js';
import ContactMessage from '../contact/contactMessage.model.js';
import SiteSetting from './siteSetting.model.js';
import ActivityLog from './activityLog.model.js';
import { ORDER_STATUSES } from '../../utils/constants.js';

class DashboardRepository {
  // ──────────────────────────────────────────
  // Metrics
  // ──────────────────────────────────────────
  
  async getTotalUsers() {
    return User.countDocuments();
  }

  async getTotalOrders() {
    return Order.countDocuments();
  }

  async getTotalRevenue() {
    const result = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    return result.length > 0 ? result[0].totalRevenue : 0;
  }

  async getRecentOrders(limit = 5) {
    return Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'firstName lastName email');
  }

  async getLowStockVariants(threshold = 10, limit = 10) {
    return ProductVariant.find({ stock: { $lte: threshold } })
      .populate('product', 'name images')
      .sort({ stock: 1 })
      .limit(limit);
  }

  async getRecentContactMessages(limit = 5) {
    return ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getRecentOrderRemarks(limit = 5) {
    return Order.find({ customerNote: { $exists: true, $ne: '' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'firstName lastName email');
  }

  // ──────────────────────────────────────────
  // Site Settings
  // ──────────────────────────────────────────

  async getSettings() {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({
        siteName: 'My E-Commerce',
        supportEmail: 'support@example.com',
      });
    }
    return settings;
  }

  async updateSettings(updateData) {
    const settings = await SiteSetting.findOne();
    if (!settings) {
      return SiteSetting.create(updateData);
    }
    Object.assign(settings, updateData);
    return settings.save();
  }

  // ──────────────────────────────────────────
  // Activity Logs
  // ──────────────────────────────────────────

  async getRecentLogs(limit = 20) {
    return ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('admin', 'firstName lastName email');
  }

  async logAction(adminId, action, target, details) {
    return ActivityLog.create({
      admin: adminId,
      action,
      target,
      details,
    });
  }
}

export default new DashboardRepository();
