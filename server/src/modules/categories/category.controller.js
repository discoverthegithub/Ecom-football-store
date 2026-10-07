/**
 * Category & Subcategory Controller
 * -----------------------------------
 */

import categoryService from './category.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { clearCache } from '../../utils/cache.js';

class CategoryController {
  // ──────────────────────────────────────────
  // Categories
  // ──────────────────────────────────────────

  createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body, req.file?.buffer);
    await clearCache('categories');
    ApiResponse.created(res, category, 'Category created successfully');
  });

  getAllCategories = asyncHandler(async (req, res) => {
    // Admin gets all, users get only active
    const includeInactive = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const categories = await categoryService.getAllCategories(includeInactive);
    ApiResponse.ok(res, categories, 'Categories fetched successfully');
  });

  getCategoryById = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params.id);
    ApiResponse.ok(res, category, 'Category fetched successfully');
  });

  updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body, req.file?.buffer);
    await clearCache('categories');
    ApiResponse.ok(res, category, 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    await clearCache('categories');
    ApiResponse.ok(res, null, 'Category deleted successfully');
  });

  // ──────────────────────────────────────────
  // Subcategories
  // ──────────────────────────────────────────

  createSubcategory = asyncHandler(async (req, res) => {
    const subcategory = await categoryService.createSubcategory(req.body);
    await clearCache('categories');
    ApiResponse.created(res, subcategory, 'Subcategory created successfully');
  });

  getAllSubcategories = asyncHandler(async (req, res) => {
    const includeInactive = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const subcategories = await categoryService.getAllSubcategories(includeInactive);
    ApiResponse.ok(res, subcategories, 'Subcategories fetched successfully');
  });

  getSubcategoriesByCategory = asyncHandler(async (req, res) => {
    const includeInactive = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const subcategories = await categoryService.getSubcategoriesByCategory(req.params.id, includeInactive);
    ApiResponse.ok(res, subcategories, 'Subcategories fetched successfully');
  });

  getSubcategoryById = asyncHandler(async (req, res) => {
    const subcategory = await categoryService.getSubcategoryById(req.params.id);
    ApiResponse.ok(res, subcategory, 'Subcategory fetched successfully');
  });

  updateSubcategory = asyncHandler(async (req, res) => {
    const subcategory = await categoryService.updateSubcategory(req.params.id, req.body);
    await clearCache('categories');
    ApiResponse.ok(res, subcategory, 'Subcategory updated successfully');
  });

  deleteSubcategory = asyncHandler(async (req, res) => {
    await categoryService.deleteSubcategory(req.params.id);
    await clearCache('categories');
    ApiResponse.ok(res, null, 'Subcategory deleted successfully');
  });
}

export default new CategoryController();
