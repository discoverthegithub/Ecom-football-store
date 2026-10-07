/**
 * Product & Variant Repository
 * ------------------------------
 */

import Product from './product.model.js';
import ProductVariant from './productVariant.model.js';

class ProductRepository {
  // ──────────────────────────────────────────
  // Products
  // ──────────────────────────────────────────
  async createProduct(data) {
    return Product.create(data);
  }

  async findProducts(filter = {}, skip = 0, limit = 10, sort = '-createdAt') {
    return Product.find(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countProducts(filter = {}) {
    return Product.countDocuments(filter);
  }

  async findProductById(id) {
    return Product.findById(id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
  }

  async findProductBySlug(slug) {
    return Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
  }

  async updateProduct(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteProduct(id) {
    return Product.findByIdAndDelete(id);
  }

  // ──────────────────────────────────────────
  // Product Variants
  // ──────────────────────────────────────────
  async createVariant(data) {
    return ProductVariant.create(data);
  }

  async findVariantsByProduct(productId, includeInactive = false) {
    const filter = { product: productId };
    if (!includeInactive) {filter.isActive = true;}
    return ProductVariant.find(filter);
  }

  async findVariantById(id) {
    return ProductVariant.findById(id);
  }

  async updateVariant(id, data) {
    return ProductVariant.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteVariant(id) {
    return ProductVariant.findByIdAndDelete(id);
  }
}

export default new ProductRepository();
