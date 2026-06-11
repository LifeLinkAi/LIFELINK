import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../middlewares/error.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { logger } from '../utils/logger';
import { parsePdfBuffer, parseExcelBuffer } from '../services/parser/bulkParse.service';

const router = Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

router.post('/parse-bulk', authenticate, upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded.'));
    }

    const { mimetype, originalname, buffer } = req.file;
    let records: { name: string; email: string }[] = [];

    logger.info(`Parsing bulk file: ${originalname} (${mimetype})`);

    const ext = originalname.split('.').pop()?.toLowerCase();

    if (mimetype === 'application/pdf' || ext === 'pdf') {
      records = await parsePdfBuffer(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel' ||
      ext === 'xlsx' ||
      ext === 'xls' ||
      ext === 'csv' ||
      mimetype === 'text/csv'
    ) {
      records = parseExcelBuffer(buffer);
    } else {
      return next(new ApiError(400, 'Unsupported file type. Only PDF, XLSX, XLS, and CSV are accepted.'));
    }

    logger.info(`Successfully parsed ${records.length} records from ${originalname}`);

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error: any) {
    logger.error(`Error parsing bulk upload: ${error.message}`);
    next(new ApiError(500, `Failed to parse file: ${error.message}`));
  }
});

router.post('/', authenticate, upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'No file uploaded.'));
    }

    if (!isCloudinaryConfigured()) {
      return next(new ApiError(503, 'Cloudinary upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env, then restart the server.'));
    }

    const fileBuffer = req.file.buffer;
    
    // Create a promise-based wrapper for Cloudinary upload stream
    const uploadToCloudinary = (buffer: Buffer, originalname: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'lifelink_documents',
            resource_type: 'auto',
            public_id: originalname.split('.')[0] + '-' + Date.now(),
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        const readableStream = new Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
    };

    logger.info(`Uploading file ${req.file.originalname} to Cloudinary...`);
    const result = await uploadToCloudinary(fileBuffer, req.file.originalname);
    logger.info(`File uploaded successfully. Cloudinary URL: ${result.secure_url}`);

    res.status(200).json({
      success: true,
      url: result.secure_url,
    });
  } catch (error: any) {
    logger.error(`Failed to upload file to Cloudinary: ${error.message}`);
    next(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
  }
});

export default router;
