/**
 * Category & Subcategory Service
 * --------------------------------
 */

import categoryRepository from './category.repository.js';
import ApiError from '../../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.config.js';

class CategoryService {
  // ──────────────────────────────────────────
  // Categories
  // ──────────────────────────────────────────

  async createCategory(data, imageBuffer) {
    let imageUrl = '';
    let imagePublicId = '';

    if (imageBuffer) {
      const result = await uploadToCloudinary(imageBuffer, 'categories');
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    return categoryRepository.createCategory({
      ...data,
      image: { url: imageUrl, public_id: imagePublicId },
    });
  }

  async getAllCategories(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return categoryRepository.findAllCategories(filter);
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findCategoryById(id);
    if (!category) {throw ApiError.notFound('Category not found');}
    return category;
  }

  async updateCategory(id, data, imageBuffer) {
    const category = await categoryRepository.findCategoryById(id);
    if (!category) {throw ApiError.notFound('Category not found');}

    const updateData = { ...data };

    if (imageBuffer) {
      const result = await uploadToCloudinary(imageBuffer, 'categories');
      updateData.image = { url: result.secure_url, public_id: result.public_id };

      if (category.image?.public_id) {
        await deleteFromCloudinary(category.image.public_id);
      }
    }

    return categoryRepository.updateCategory(id, updateData);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findCategoryById(id);
    if (!category) {throw ApiError.notFound('Category not found');}

    // Make sure no subcategories depend on this category
    const subcategories = await categoryRepository.findAllSubcategories({ category: id });
    if (subcategories.length > 0) {
      throw ApiError.badRequest('Cannot delete category with existing subcategories');
    }

    if (category.image?.public_id) {
      await deleteFromCloudinary(category.image.public_id);
    }

    return categoryRepository.deleteCategory(id);
  }

  // ──────────────────────────────────────────
  // Subcategories
  // ──────────────────────────────────────────

  async createSubcategory(data) {
    const category = await categoryRepository.findCategoryById(data.category);
    if (!category) {throw ApiError.badRequest('Parent category not found');}

    return categoryRepository.createSubcategory(data);
  }

  async getAllSubcategories(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return categoryRepository.findAllSubcategories(filter);
  }

  async getSubcategoryById(id) {
    const subcat = await categoryRepository.findSubcategoryById(id);
    if (!subcat) {throw ApiError.notFound('Subcategory not found');}
    return subcat;
  }

  async getSubcategoriesByCategory(categoryId, includeInactive = false) {
    const filter = { category: categoryId };
    if (!includeInactive) {filter.isActive = true;}
    return categoryRepository.findAllSubcategories(filter);
  }

  async updateSubcategory(id, data) {
    if (data.category) {
      const category = await categoryRepository.findCategoryById(data.category);
      if (!category) {throw ApiError.badRequest('Parent category not found');}
    }

    const subcat = await categoryRepository.updateSubcategory(id, data);
    if (!subcat) {throw ApiError.notFound('Subcategory not found');}
    return subcat;
  }

  async deleteSubcategory(id) {
    const subcat = await categoryRepository.deleteSubcategory(id);
    if (!subcat) {throw ApiError.notFound('Subcategory not found');}
    return subcat;
  }
}

export default new CategoryService();
