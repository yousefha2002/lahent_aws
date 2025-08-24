import { Module } from '@nestjs/common';
import { ProductCategoryVariantService } from './product_category_variant.service';
import { ProductCategoryVariantController } from './product_category_variant.controller';
import { ProductVariantCategoryProvider } from './providers/product_category_variant.provider';

@Module({
  controllers: [ProductCategoryVariantController],
  providers: [ProductCategoryVariantService,...ProductVariantCategoryProvider],
  exports:[ProductCategoryVariantService]
})
export class ProductCategoryVariantModule {}
