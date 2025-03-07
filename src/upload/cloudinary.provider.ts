import { v2 as cloudinary } from 'cloudinary';
import { type Provider } from '@nestjs/common';

import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
config(); // Load biến môi trường từ .env

const configService = new ConfigService();

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  },
  inject: [ConfigService],
};
