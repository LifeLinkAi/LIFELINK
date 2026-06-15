import { v2 as cloudinary } from 'cloudinary';

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
};

const PLACEHOLDER_VALUES = new Set([
  '',
  'your_cloudinary_cloud_name',
  'your_cloudinary_api_key',
  'your_cloudinary_api_secret',
]);

export const isCloudinaryConfigured = (): boolean => {
  return !PLACEHOLDER_VALUES.has(cloudinaryConfig.cloud_name)
    && !PLACEHOLDER_VALUES.has(cloudinaryConfig.api_key)
    && !PLACEHOLDER_VALUES.has(cloudinaryConfig.api_secret);
};

cloudinary.config(cloudinaryConfig);

export default cloudinary;
