/**
 * Dashboard & Settings Service
 * ----------------------------
 */

import dashboardRepository from './dashboard.repository.js';
import { uploadToCloudinary } from '../../config/cloudinary.config.js';

class DashboardService {
  async getDashboardMetrics() {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockVariants,
      recentContactMessages,
      recentOrderRemarks
    ] = await Promise.all([
      dashboardRepository.getTotalUsers(),
      dashboardRepository.getTotalOrders(),
      dashboardRepository.getTotalRevenue(),
      dashboardRepository.getRecentOrders(5),
      dashboardRepository.getLowStockVariants(10, 10),
      dashboardRepository.getRecentContactMessages(5),
      dashboardRepository.getRecentOrderRemarks(5),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockVariants,
      recentContactMessages,
      recentOrderRemarks,
    };
  }

  async getSettings() {
    return dashboardRepository.getSettings();
  }

  async updateSettings(adminId, updateData, logoBuffer) {
    if (logoBuffer) {
      const result = await uploadToCloudinary(logoBuffer, 'settings');
      updateData.logo = result.secure_url;
    }

    const newSettings = await dashboardRepository.updateSettings(updateData);
    
    // Log this action
    await dashboardRepository.logAction(
      adminId,
      'UPDATE_SETTINGS',
      'SiteSettings',
      'Admin updated global site settings.'
    );

    return newSettings;
  }

  async getRecentActivityLogs() {
    return dashboardRepository.getRecentLogs(50);
  }
}

export default new DashboardService();
