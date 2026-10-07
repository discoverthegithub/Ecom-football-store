/**
 * Dashboard & Settings Controller
 * -------------------------------
 */

import dashboardService from './dashboard.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class DashboardController {
  getMetrics = asyncHandler(async (req, res) => {
    const metrics = await dashboardService.getDashboardMetrics();
    ApiResponse.ok(res, metrics, 'Dashboard metrics fetched successfully');
  });

  getSettings = asyncHandler(async (req, res) => {
    const settings = await dashboardService.getSettings();
    ApiResponse.ok(res, settings, 'Settings fetched successfully');
  });

  updateSettings = asyncHandler(async (req, res) => {
    // If socialLinks comes in as string (from form-data), parse it
    if (req.body.socialLinks && typeof req.body.socialLinks === 'string') {
      try {
        req.body.socialLinks = JSON.parse(req.body.socialLinks);
      } catch (error) {
        // ignore
      }
    }
    
    // Parse numbers
    if (req.body.taxRate) {req.body.taxRate = Number(req.body.taxRate);}
    if (req.body.freeShippingThreshold) {req.body.freeShippingThreshold = Number(req.body.freeShippingThreshold);}

    const settings = await dashboardService.updateSettings(
      req.user._id,
      req.body,
      req.file?.buffer
    );
    ApiResponse.ok(res, settings, 'Settings updated successfully');
  });

  getActivityLogs = asyncHandler(async (req, res) => {
    const logs = await dashboardService.getRecentActivityLogs();
    ApiResponse.ok(res, logs, 'Activity logs fetched successfully');
  });
}

export default new DashboardController();
