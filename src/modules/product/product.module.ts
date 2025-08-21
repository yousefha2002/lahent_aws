import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductProvider } from './providers/product.provider';
import { OwnerModule } from '../owner/owner.module';
import { StoreModule } from '../store/store.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ProductImageModule } from '../product_image/product_image.module';
import { ProductInstructionModule } from '../product_instruction/product_instruction.module';
import { ProductExtraModule } from '../product_extra/product_extra.module';
import { ProuductVariantModule } from '../prouduct_variant/prouduct_variant.module';
import { DatabaseModule } from 'src/database/database.module';
import { CategoryModule } from '../category/category.module';
import { OfferModule } from '../offer/offer.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ...ProductProvider],
  exports: [ProductService],
  imports: [
    OwnerModule,
    StoreModule,
    CloudinaryModule,
    ProductImageModule,
    DatabaseModule,
    forwardRef(() => OfferModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => ProductExtraModule),
    forwardRef(() => ProductInstructionModule),
    forwardRef(() => ProuductVariantModule),
  ],
})
export class ProductModule {}
