/**
 * Review Controller
 * -------------------
 */

import reviewService from './review.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

class ReviewController {
  addReview = asyncHandler(async (req, res) => {
    const review = await reviewService.addReview(req.user._id, req.body);
    ApiResponse.created(res, review, 'Review added successfully');
  });

  getProductReviews = asyncHandler(async (req, res) => {
    const result = await reviewService.getProductReviews(req.params.productId, req.query);
    ApiResponse.ok(res, result, 'Reviews fetched successfully');
  });

  updateReview = asyncHandler(async (req, res) => {
    const review = await reviewService.updateReview(req.user._id, req.params.id, req.body);
    ApiResponse.ok(res, review, 'Review updated successfully');
  });

  deleteReview = asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.user._id, req.params.id, req.user.role);
    ApiResponse.ok(res, null, 'Review deleted successfully');
  });
}

export default new ReviewController();
