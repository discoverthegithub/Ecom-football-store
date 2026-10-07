/**
 * Upload Middleware
 * -------------------
 * Configures Multer to accept file uploads into memory.
 * Includes file size limits and file type filtering.
 * Files are processed from memory directly to Cloudinary.
 */

import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Configure memory storage
const storage = multer.memoryStorage();

// File filter (accept only images)
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file type. Only images are allowed.'), false);
  }
};

// Create multer instance for avatars (2MB limit)
export const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

// Create multer instance for product images (5MB limit, up to 10 files)
export const uploadProductImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
