import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type {
  CloudinaryDeleteResult,
  CloudinaryResponse,
} from './interfaces/cloudinary-response.interface';
import streamifier from 'streamifier';
import sharp from 'sharp';
import { diskStorage } from 'multer';
import path from 'path';

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly maxRetries = 3;

  optimizeImage(
    buffer: Buffer,
    options: { width?: number; quality?: number } = {},
  ): Promise<Buffer> {
    const { width = 1200, quality = 80 } = options;

    const optimize = sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    return optimize;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'default',
    optimize = true,
  ): Promise<CloudinaryResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      // Tối ưu hóa ảnh nếu cần
      const fileBuffer = optimize
        ? await this.optimizeImage(file.buffer)
        : file.buffer;

      return await this.uploadImageWithRetry(
        {
          ...file,
          buffer: fileBuffer,
        },
        folder,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to upload image: ${err.message}`, err.stack);
      throw new BadRequestException(`Upload failed: ${err.message}`);
    }
  }

  private async uploadImageWithRetry(
    file: Express.Multer.File,
    folder: string,
    attempt = 0,
  ): Promise<CloudinaryResponse> {
    try {
      return await this.uploadToCloudinary(file, folder);
    } catch (error) {
      if (attempt < this.maxRetries) {
        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt);
        this.logger.warn(
          `Upload attempt ${attempt + 1} failed, retrying in ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.uploadImageWithRetry(file, folder, attempt + 1);
      }
      throw error;
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<CloudinaryResponse> {
    try {
      const result = await new Promise<CloudinaryResponse>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'auto',
              eager: [
                { width: 300, height: 300, crop: 'fill' }, // Thumbnail
                { width: 800, crop: 'scale' }, // Medium size
              ],
              eager_async: true,
              format: 'webp', // Convert to WebP format
              quality: 'auto:good', // Auto-select good quality
              fetch_format: 'auto',
              cache_control: 'max-age=2592000', // Cache for 30 days
            },
            (error, result) => {
              if (error) return reject(error as Error);
              resolve(result as any);
            },
          );

          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        },
      );

      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to upload image to Cloudinary: ${err.message}`,
        err.stack,
      );
      throw new Error(`Failed to upload image to Cloudinary: ${err.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder = 'default',
  ): Promise<CloudinaryResponse[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }
  async deleteImage(publicId: string): Promise<any> {
    try {
      if (!publicId) {
        throw new BadRequestException(
          'Public ID is required to delete an image.',
        );
      }

      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as CloudinaryDeleteResult;

      if (result.result !== 'ok') {
        throw new BadRequestException(`Failed to delete image: ${publicId}`);
      }

      return { message: 'Image deleted successfully', result };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to delete image ${publicId}: ${err.message}`,
        err.stack,
      );

      throw new InternalServerErrorException(
        `Failed to delete image: ${err.message}`,
      );
    }
  }

  static multerOptions = {
    storage: diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${timestamp}${ext}`);
      },
    }),
    fileFilter: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  };
}
