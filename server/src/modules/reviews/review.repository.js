/**
 * Review Repository
 * -------------------
 */

import Review from './review.model.js';
import Product from '../products/product.model.js';

class ReviewRepository {
  async createReview(data) {
    return Review.create(data);
  }

  async findReviewByUserAndProduct(userId, productId) {
    return Review.findOne({ user: userId, product: productId });
  }

  async findReviewsByProduct(productId, skip = 0, limit = 10, sort = '-createdAt') {
    return Review.find({ product: productId, isApproved: true })
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countReviewsByProduct(productId) {
    return Review.countDocuments({ product: productId, isApproved: true });
  }

  async findReviewById(id) {
    return Review.findById(id);
  }

  async updateReview(id, data) {
    return Review.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteReview(id) {
    return Review.findByIdAndDelete(id);
  }

  /**
   * Aggregates the average rating for a specific product and updates the Product model.
   */
  async updateProductAverageRating(productId) {
    const stats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        numReviews: stats[0].numReviews,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0,
      });
    }
  }
}

export default new ReviewRepository();
