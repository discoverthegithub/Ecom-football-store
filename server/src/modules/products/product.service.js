/**
 * Product & Variant Service
 * ---------------------------
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Category from '../categories/category.model.js';
import ProductVariant from './productVariant.model.js';
import productRepository from './product.repository.js';
import categoryRepository from '../categories/category.repository.js';
import ApiError from '../../utils/ApiError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.config.js';
import { PRODUCT_STATUS } from '../../utils/constants.js';

class ProductService {
  // ──────────────────────────────────────────
  // Products
  // ──────────────────────────────────────────

  async createProduct(data, imageFiles) {
    // Validate or resolve category by ObjectId or Name
    let categoryObj = null;
    if (data.category && mongoose.Types.ObjectId.isValid(data.category)) {
      categoryObj = await categoryRepository.findCategoryById(data.category);
    }
    if (!categoryObj && data.category) {
      categoryObj = await Category.findOne({ name: new RegExp(`^${data.category}$`, 'i') });
    }
    if (!categoryObj) {
      categoryObj = await Category.findOne({ isActive: true });
    }
    if (!categoryObj) {
      categoryObj = await Category.create({ name: 'Clubs', description: 'Football Club Shirts' });
    }
    data.category = categoryObj._id;

    if (data.subcategory) {
      const subcategory = await categoryRepository.findSubcategoryById(data.subcategory);
      if (!subcategory) {throw ApiError.badRequest('Invalid subcategory ID');}
      if (subcategory.category._id.toString() !== data.category) {
        throw ApiError.badRequest('Subcategory does not belong to the specified category');
      }
    }

    // Ensure gender is valid enum ('men', 'women', 'unisex')
    if (!data.gender || data.gender === 'undefined' || data.gender === 'null' || !['men', 'women', 'unisex'].includes(data.gender)) {
      data.gender = 'unisex';
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const images = [];
    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        let url = '';
        let public_id = `img_${Date.now()}_${i}`;

        if (file.buffer) {
          const ext = path.extname(file.originalname || '.jpg') || '.jpg';
          const filename = `kit_${Date.now()}_${i}${ext}`;
          const savePath = path.join(uploadsDir, filename);

          fs.writeFileSync(savePath, file.buffer);
          url = `http://localhost:5000/uploads/${filename}`;
          public_id = filename;
        } else if (file.path || file.filename) {
          url = `http://localhost:5000/uploads/${file.filename || file.originalname}`;
          public_id = file.filename || `img_${Date.now()}_${i}`;
        }

        if (url) {
          images.push({
            url,
            public_id,
            isPrimary: i === 0,
          });
        }
      }
    }

    if (images.length === 0) {
      images.push({
        url: data.kitImages?.front || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=800',
        public_id: `default_kit_${Date.now()}`,
        isPrimary: true,
      });
    }

    const primaryImg = images.find(img => img.isPrimary) || images[0];
    const secondaryImg = images.find(img => img.url !== primaryImg?.url) || images[1] || primaryImg;

    const kitImages = {
      front: primaryImg?.url || '',
      back: secondaryImg?.url || primaryImg?.url || '',
      detail: '',
    };

    const createdProduct = await productRepository.createProduct({ ...data, images, kitImages });

    // Auto-create stock size variants (S, M, L, XL, XXL) with configured stock
    const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const pName = (createdProduct.name || 'KIT').substring(0, 3).toUpperCase();
    let sizeStockMap = {};

    if (data.sizeStock && typeof data.sizeStock === 'object') {
      sizeStockMap = data.sizeStock;
    } else if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
      const totalStock = Math.max(0, parseInt(data.stock, 10) || 0);
      const perSize = Math.floor(totalStock / defaultSizes.length);
      const remainder = totalStock % defaultSizes.length;
      defaultSizes.forEach((sz, idx) => {
        sizeStockMap[sz] = perSize + (idx === 0 ? remainder : 0);
      });
    } else {
      defaultSizes.forEach(sz => { sizeStockMap[sz] = 25; });
    }

    for (const size of defaultSizes) {
      try {
        const itemStock = sizeStockMap[size] !== undefined ? Number(sizeStockMap[size]) : 25;
        await ProductVariant.create({
          product: createdProduct._id,
          sku: `${pName}-${size}-${Math.floor(1000 + Math.random() * 9000)}`,
          size,
          color: { name: 'Official Edition', hexCode: '#C5A059' },
          price: createdProduct.price || 120.00,
          stock: itemStock,
          isActive: true
        });
      } catch (err) {
        console.error('Auto variant creation warning:', err.message);
      }
    }

    return createdProduct;
  }

  async getProducts(query, includeInactive = false) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (!includeInactive) {filter.status = PRODUCT_STATUS.ACTIVE;}

    // Kit & Football Filters
    if (query.team) { filter.team = { $regex: query.search || query.team, $options: 'i' }; }
    if (query.league_or_type) { filter.league_or_type = query.league_or_type; }
    if (query.league) { filter.league = { $regex: query.league, $options: 'i' }; }
    if (query.season) { filter.season = query.season; }
    if (query.isVintage !== undefined && query.isVintage !== '') {
      filter.isVintage = query.isVintage === 'true' || query.isVintage === true;
    }
    if (query.size) { filter.stock_sizes = { $in: [query.size] }; }

    // Price Filtering
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }
    
    // Search
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { team: { $regex: query.search, $options: 'i' } },
        { league: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    // Price range filtering (handled on variants ideally, but can do base price if added to product model)
    // Note: Since price is on Variant, we would need an aggregation pipeline to filter products by price.
    // For simplicity, we assume we fetch products and their default variant on the frontend.

    let sort = '-createdAt';
    if (query.sort) {
      switch (query.sort) {
        case 'newest': sort = '-createdAt'; break;
        case 'oldest': sort = 'createdAt'; break;
        case 'name_asc': sort = 'name'; break;
        case 'name_desc': sort = '-name'; break;
      }
    }

    const [products, total] = await Promise.all([
      productRepository.findProducts(filter, skip, limit, sort),
      productRepository.countProducts(filter),
    ]);

    // Attach variants to each product (and ensure products without variants get default size variants created)
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        let variants = await productRepository.findVariantsByProduct(product._id, includeInactive);
        if (!variants || variants.length === 0) {
          const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
          const pName = (product.name || 'KIT').substring(0, 3).toUpperCase();
          for (const size of defaultSizes) {
            try {
              await ProductVariant.create({
                product: product._id,
                sku: `${pName}-${size}-${Math.floor(1000 + Math.random() * 9000)}`,
                size,
                color: { name: 'Official Edition', hexCode: '#C5A059' },
                price: product.price || 120.00,
                stock: 20,
                isActive: true
              });
            } catch (err) {
              // ignore duplicate
            }
          }
          variants = await productRepository.findVariantsByProduct(product._id, includeInactive);
        }
        return { ...product.toObject(), variants };
      })
    );

    return {
      products: productsWithVariants,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id, includeInactive = false) {
    const product = await productRepository.findProductById(id);
    if (!product || (!includeInactive && product.status !== 'active')) {
      throw ApiError.notFound('Product not found');
    }
    const variants = await productRepository.findVariantsByProduct(id, includeInactive);
    return { ...product.toObject(), variants };
  }

  async getProductBySlug(slug, includeInactive = false) {
    const product = await productRepository.findProductBySlug(slug);
    if (!product || (!includeInactive && product.status !== 'active')) {
      throw ApiError.notFound('Product not found');
    }
    const variants = await productRepository.findVariantsByProduct(product._id, includeInactive);
    return { ...product.toObject(), variants };
  }

  async updateProduct(id, data, newImageFiles = [], imagesToDelete = []) {
    const product = await productRepository.findProductById(id);
    if (!product) {throw ApiError.notFound('Product not found');}

    // Ensure gender is valid enum ('men', 'women', 'unisex')
    if (!data.gender || data.gender === 'undefined' || data.gender === 'null' || !['men', 'women', 'unisex'].includes(data.gender)) {
      data.gender = 'unisex';
    }

    const currentImages = [...(product.images || [])];

    // Delete requested images
    if (imagesToDelete.length > 0) {
      for (const publicId of imagesToDelete) {
        try { await deleteFromCloudinary(publicId); } catch (e) { /* ignore */ }
        const index = currentImages.findIndex(img => img.public_id === publicId);
        if (index > -1) { currentImages.splice(index, 1); }
      }
    }

    // Save new uploaded image files
    if (newImageFiles && newImageFiles.length > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const newImages = [];
      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i];
        let url = '';
        let public_id = `img_${Date.now()}_${i}`;

        if (file.buffer) {
          const ext = path.extname(file.originalname || '.jpg') || '.jpg';
          const filename = `kit_${Date.now()}_${i}${ext}`;
          const savePath = path.join(uploadsDir, filename);

          fs.writeFileSync(savePath, file.buffer);
          url = `http://localhost:5000/uploads/${filename}`;
          public_id = filename;
        } else if (file.path || file.filename) {
          url = `http://localhost:5000/uploads/${file.filename || file.originalname}`;
          public_id = file.filename || `img_${Date.now()}_${i}`;
        }

        if (url) {
          newImages.push({
            url,
            public_id,
            isPrimary: i === 0, // First new file becomes primary!
          });
        }
      }

      if (newImages.length > 0) {
        // Replace old images completely with the newly uploaded kit photos
        currentImages.length = 0;
        currentImages.push(...newImages);
      }
    }

    // Ensure at least one image is primary if there are images
    if (currentImages.length > 0 && !currentImages.some(img => img.isPrimary)) {
      currentImages[0].isPrimary = true;
    }

    // Set primary explicitly if provided in data
    if (data.primaryImagePublicId) {
      currentImages.forEach(img => {
        img.isPrimary = img.public_id === data.primaryImagePublicId;
      });
    }

    const primaryImg = currentImages.find(img => img.isPrimary) || currentImages[0];
    const secondaryImg = currentImages.find(img => img.url !== primaryImg?.url) || currentImages[1] || primaryImg;

    const kitImages = {
      front: primaryImg?.url || '',
      back: secondaryImg?.url || primaryImg?.url || '',
      detail: '',
    };

    // Update variant stock if stock parameter is present
    if (data.stock !== undefined && data.stock !== null && data.stock !== '') {
      const totalStock = Math.max(0, parseInt(data.stock, 10) || 0);
      const variants = await productRepository.findVariantsByProduct(id, true);
      if (variants && variants.length > 0) {
        const perSize = Math.floor(totalStock / variants.length);
        const remainder = totalStock % variants.length;
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          v.stock = perSize + (i === 0 ? remainder : 0);
          await v.save();
        }
      }
    } else if (data.sizeStock && typeof data.sizeStock === 'object') {
      const variants = await productRepository.findVariantsByProduct(id, true);
      for (const v of variants) {
        if (data.sizeStock[v.size] !== undefined) {
          v.stock = Math.max(0, parseInt(data.sizeStock[v.size], 10) || 0);
          await v.save();
        }
      }
    }

    return productRepository.updateProduct(id, { ...data, images: currentImages, kitImages });
  }

  async deleteProduct(id) {
    const product = await productRepository.findProductById(id);
    if (!product) {throw ApiError.notFound('Product not found');}

    // Delete all variants
    const variants = await productRepository.findVariantsByProduct(id, true);
    for (const variant of variants) {
      // If variants had images, delete them here
      if (variant.image?.public_id) {await deleteFromCloudinary(variant.image.public_id);}
      await productRepository.deleteVariant(variant._id);
    }

    // Delete product images
    for (const img of product.images) {
      if (img.public_id) {await deleteFromCloudinary(img.public_id);}
    }

    return productRepository.deleteProduct(id);
  }

  // ──────────────────────────────────────────
  // Product Variants
  // ──────────────────────────────────────────

  async createVariant(data, imageBuffer) {
    const product = await productRepository.findProductById(data.product);
    if (!product) {throw ApiError.notFound('Product not found');}

    let imageUrl = '';
    let imagePublicId = '';

    if (imageBuffer) {
      const result = await uploadToCloudinary(imageBuffer, 'variants');
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    return productRepository.createVariant({
      ...data,
      image: imageUrl ? { url: imageUrl, public_id: imagePublicId } : null,
    });
  }

  async updateVariant(id, data, imageBuffer) {
    const variant = await productRepository.findVariantById(id);
    if (!variant) {throw ApiError.notFound('Variant not found');}

    const updateData = { ...data };

    if (imageBuffer) {
      const result = await uploadToCloudinary(imageBuffer, 'variants');
      updateData.image = { url: result.secure_url, public_id: result.public_id };

      if (variant.image?.public_id) {
        await deleteFromCloudinary(variant.image.public_id);
      }
    }

    return productRepository.updateVariant(id, updateData);
  }

  async deleteVariant(id) {
    const variant = await productRepository.findVariantById(id);
    if (!variant) {throw ApiError.notFound('Variant not found');}

    if (variant.image?.public_id) {
      await deleteFromCloudinary(variant.image.public_id);
    }

    return productRepository.deleteVariant(id);
  }
}

export default new ProductService();
