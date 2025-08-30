import { forwardRef, Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OfferProvider } from './providers/offer.provider';
import { OwnerModule } from '../owner/owner.module';
import { StoreModule } from '../store/store.module';
import { OfferProductModule } from '../offer_product/offer_product.module';
import { OfferCategoryModule } from '../offer_category/offer_category.module';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [OfferController],
  providers: [OfferService, ...OfferProvider],
  imports: [OwnerModule, StoreModule,OfferProductModule,OfferCategoryModule,CategoryModule,ProductModule,AdminModule],
  exports: [OfferService],
})
export class OfferModule {}
