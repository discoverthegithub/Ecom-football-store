/**
 * Review Service
 * ----------------
 */

import reviewRepository from './review.repository.js';
import productRepository from '../products/product.repository.js';
import orderRepository from '../orders/order.repository.js';
import ApiError from '../../utils/ApiError.js';
import { ORDER_STATUSES } from '../../utils/constants.js';

class ReviewService {
  /**
   * Helper to verify if a user has actually purchased the product.
   */
  async _verifyPurchase(userId, productId) {
    // Find any order by this user that contains this product and is DELIVERED
    const orders = await orderRepository.findOrdersByUser(userId, 0, 100);
    const hasPurchased = orders.some(order => 
      order.status === ORDER_STATUSES.DELIVERED &&
      order.items.some(item => item.product._id.toString() === productId)
    );

    if (!hasPurchased) {
      throw ApiError.forbidden('You can only review products you have purchased and received.');
    }
  }

  async addReview(userId, data) {
    // 1. Check if product exists
    const product = await productRepository.findProductById(data.product);
    if (!product) {throw ApiError.notFound('Product not found');}

    // 2. Check if user already reviewed this product
    const existingReview = await reviewRepository.findReviewByUserAndProduct(userId, data.product);
    if (existingReview) {
      throw ApiError.badRequest('You have already submitted a review for this product.');
    }

    // 3. Verify the user actually purchased the product
    await this._verifyPurchase(userId, data.product);

    // 4. Create Review
    const reviewData = {
      ...data,
      user: userId,
      // In a real app, you might want isApproved to default to false and require admin approval.
      // We'll set it to true for immediate feedback in this demo.
      isApproved: true, 
    };

    const review = await reviewRepository.createReview(reviewData);

    // 5. Update Product Averages
    await reviewRepository.updateProductAverageRating(data.product);

    return review;
  }

  async getProductReviews(productId, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      reviewRepository.findReviewsByProduct(productId, skip, limit),
      reviewRepository.countReviewsByProduct(productId),
    ]);

    return {
      reviews,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async updateReview(userId, reviewId, data) {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) {throw ApiError.notFound('Review not found');}

    if (review.user.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only update your own reviews');
    }

    const updatedReview = await reviewRepository.updateReview(reviewId, data);
    
    // Update Product Averages
    await reviewRepository.updateProductAverageRating(review.product);

    return updatedReview;
  }

  async deleteReview(userId, reviewId, userRole) {
    const review = await reviewRepository.findReviewById(reviewId);
    if (!review) {throw ApiError.notFound('Review not found');}

    if (review.user.toString() !== userId.toString() && !['admin', 'super_admin'].includes(userRole)) {
      throw ApiError.forbidden('You do not have permission to delete this review');
    }

    await reviewRepository.deleteReview(reviewId);
    
    // Update Product Averages
    await reviewRepository.updateProductAverageRating(review.product);

    return true;
  }
}

export default new ReviewService();
