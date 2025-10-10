import { forwardRef, Module } from '@nestjs/common';
import { ProuductVariantService } from './prouduct_variant.service';
import { ProuductVariantController } from './prouduct_variant.controller';
import { ProductVariantProvider } from './providers/prouduct_variant.provider';
import { ProductModule } from '../product/product.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ProductCategoryVariantModule } from '../product_category_variant/product_category_variant.module';
import { VariantCategoryModule } from '../variant_category/variant_category.module';
import { ProductVariantLanguageProvider } from './providers/product_variant_language.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [ProuductVariantController],
  providers: [ProuductVariantService, ...ProductVariantProvider,...ProductVariantLanguageProvider],
  exports: [ProuductVariantService],
  imports: [
    forwardRef(()=>UserContextModule),
    forwardRef(() => ProductModule),
    CloudinaryModule,
    ProductCategoryVariantModule,
    VariantCategoryModule,
    DatabaseModule,
  ],
})
export class ProuductVariantModule {}
