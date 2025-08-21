import { Module } from '@nestjs/common';
import { ProductImageService } from './product_image.service';
import { ProductImageController } from './product_image.controller';
import { ProductImageProvider } from './providers/product_image.provider';

@Module({
  controllers: [ProductImageController],
  providers: [ProductImageService, ...ProductImageProvider],
  exports: [ProductImageService],
})
export class ProductImageModule {}
