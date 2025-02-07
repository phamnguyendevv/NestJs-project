import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // ✅ Đặt tiền tố API
  app.setGlobalPrefix('api');

  // ✅ Kích hoạt ValidationPipe (nếu bạn dùng DTO)
  app.useGlobalPipes(new ValidationPipe());

  // ✅ Cấu hình Swagger
  const options = new DocumentBuilder()
    .setTitle('NestJS Realworld Example App')
    .setDescription('The Realworld API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/docs', app, document);

  // ✅ Khởi động ứng dụng
  await app.listen(3000);
  Logger.log(`🚀 Application is running on: http://localhost:3000`);
}

bootstrap();
