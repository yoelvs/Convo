import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

// Configure Cloudinary if credentials are provided
if (config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and common file types
    const allowedMimes = [
      'image/', // All images
      'application/pdf', // PDFs
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/plain', // .txt
    ];
    
    const isAllowed = allowedMimes.some(mime => file.mimetype.startsWith(mime) || file.mimetype === mime);
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

// Upload file to Cloudinary (supports images and documents)
export const uploadFileToCloudinary = async (buffer, mimetype, folder = 'messages') => {
  if (!config.cloudinaryCloudName) {
    throw new Error('Cloudinary not configured');
  }

  const isImage = mimetype.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(isImage && {
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
          ],
        }),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (buffer, folder = 'avatars') => {
  if (!config.cloudinaryCloudName) {
    throw new Error('Cloudinary not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

// For development: convert image to base64 data URL if Cloudinary not configured
export const imageToDataUrl = (buffer, mimetype) => {
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

