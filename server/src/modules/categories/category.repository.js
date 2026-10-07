/**
 * Category & Subcategory Repository
 * -----------------------------------
 */

import Category from './category.model.js';
import Subcategory from './subcategory.model.js';

class CategoryRepository {
  // ──────────────────────────────────────────
  // Categories
  // ──────────────────────────────────────────
  async createCategory(data) {
    return Category.create(data);
  }

  async findAllCategories(filter = {}) {
    return Category.find(filter).sort({ name: 1 });
  }

  async findCategoryById(id) {
    return Category.findById(id);
  }

  async updateCategory(id, data) {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteCategory(id) {
    return Category.findByIdAndDelete(id);
  }

  // ──────────────────────────────────────────
  // Subcategories
  // ──────────────────────────────────────────
  async createSubcategory(data) {
    return Subcategory.create(data);
  }

  async findAllSubcategories(filter = {}) {
    return Subcategory.find(filter).populate('category', 'name slug').sort({ name: 1 });
  }

  async findSubcategoryById(id) {
    return Subcategory.findById(id).populate('category', 'name slug');
  }

  async updateSubcategory(id, data) {
    return Subcategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteSubcategory(id) {
    return Subcategory.findByIdAndDelete(id);
  }
}

export default new CategoryRepository();
