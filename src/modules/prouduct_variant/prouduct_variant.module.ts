import { forwardRef, Module } from '@nestjs/common';
import { ProuductVariantService } from './prouduct_variant.service';
import { ProuductVariantController } from './prouduct_variant.controller';
import { ProductVariantProvider } from './providers/prouduct_variant.provider';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [ProuductVariantController],
  providers: [ProuductVariantService, ...ProductVariantProvider],
  exports: [ProuductVariantService],
  imports: [
    StoreModule,
    OwnerModule,
    forwardRef(() => ProductModule),
    CloudinaryModule,
  ],
})
export class ProuductVariantModule {}
