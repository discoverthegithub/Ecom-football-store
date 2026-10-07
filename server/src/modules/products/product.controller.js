/**
 * Product & Variant Controller
 * ------------------------------
 */

import productService from './product.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { clearCache } from '../../utils/cache.js';

class ProductController {
  // ──────────────────────────────────────────
  // Products
  // ──────────────────────────────────────────

  createProduct = asyncHandler(async (req, res) => {
    // Multer array puts file objects in req.files
    const files = req.files || [];

    const product = await productService.createProduct(req.body, files);
    await clearCache('products');
    ApiResponse.created(res, product, 'Product created successfully');
  });

  getProducts = asyncHandler(async (req, res) => {
    const includeInactive = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const result = await productService.getProducts(req.query, includeInactive);
    ApiResponse.ok(res, result, 'Products fetched successfully');
  });

  getProductById = asyncHandler(async (req, res) => {
    const includeInactive = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const product = await productService.getProductById(req.params.id, includeInactive);
    ApiResponse.ok(res, product, 'Product fetched successfully');
  });

  getProductBySlug = asyncHandler(async (req, res) => {
    const includeInactive = req.user && ['admin', 'super_admin'].includes(req.user.role);
    const product = await productService.getProductBySlug(req.params.slug, includeInactive);
    ApiResponse.ok(res, product, 'Product fetched successfully');
  });

  updateProduct = asyncHandler(async (req, res) => {
    const files = req.files || [];
    
    // imagesToDelete is now automatically parsed by formDataParser if it's a JSON array
    let imagesToDelete = req.body.imagesToDelete || [];
    if (!Array.isArray(imagesToDelete)) {
      imagesToDelete = [imagesToDelete];
    }

    const product = await productService.updateProduct(req.params.id, req.body, files, imagesToDelete);
    await clearCache('products');
    ApiResponse.ok(res, product, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    await clearCache('products');
    ApiResponse.ok(res, null, 'Product deleted successfully');
  });

  // ──────────────────────────────────────────
  // Product Variants
  // ──────────────────────────────────────────

  createVariant = asyncHandler(async (req, res) => {
    const variant = await productService.createVariant(req.body, req.file?.buffer);
    await clearCache('products');
    ApiResponse.created(res, variant, 'Variant created successfully');
  });

  updateVariant = asyncHandler(async (req, res) => {
    const variant = await productService.updateVariant(req.params.id, req.body, req.file?.buffer);
    await clearCache('products');
    ApiResponse.ok(res, variant, 'Variant updated successfully');
  });

  deleteVariant = asyncHandler(async (req, res) => {
    await productService.deleteVariant(req.params.id);
    await clearCache('products');
    ApiResponse.ok(res, null, 'Variant deleted successfully');
  });
}

export default new ProductController();
