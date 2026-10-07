/**
 * Order Controller
 * -----------------
 */

import orderService from './order.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class OrderController {
  placeOrder = asyncHandler(async (req, res) => {
    const order = await orderService.placeOrder(req.user._id, req.body);
    ApiResponse.created(res, order, 'Order placed successfully');
  });

  getMyOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getMyOrders(req.user._id, req.query);
    ApiResponse.ok(res, result, 'Orders fetched successfully');
  });

  getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
    ApiResponse.ok(res, order, 'Order fetched successfully');
  });

  // Admin only
  getAllOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);
    ApiResponse.ok(res, result, 'All orders fetched successfully');
  });

  updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    ApiResponse.ok(res, order, 'Order status updated successfully');
  });
}

export default new OrderController();
