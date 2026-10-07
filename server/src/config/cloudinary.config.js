/**
 * Cloudinary Configuration
 * -------------------------
 * Configures Cloudinary SDK for image uploads (avatars, products, etc.)
 */

import { v2 as cloudinary } from 'cloudinary';
import env from './env.config.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer — The file buffer from Multer
 * @param {string} folder — Cloudinary folder name (e.g., 'avatars')
 * @returns {Promise<object>} — Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder = 'general') => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY) {
    logger.warn('⚠️  Cloudinary not configured. Skipping upload.');
    return { secure_url: '', public_id: '' };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.APP_NAME}/${folder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error(`❌ Cloudinary Upload Error: ${error.message}`);
          reject(ApiError.internal('Image upload failed.'));
        } else {
          resolve(result);
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a file from Cloudinary by its public ID.
 * @param {string} publicId — Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || !env.CLOUDINARY_CLOUD_NAME) {return;}

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`❌ Cloudinary Delete Error: ${error.message}`);
    // Don't throw — failing to delete old image shouldn't block main execution
  }
};

export default cloudinary;
