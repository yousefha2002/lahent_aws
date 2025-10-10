import { forwardRef, Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OfferProvider } from './providers/offer.provider';
import { OfferProductModule } from '../offer_product/offer_product.module';
import { OfferCategoryModule } from '../offer_category/offer_category.module';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [OfferController],
  providers: [OfferService, ...OfferProvider],
  imports: [OfferProductModule,OfferCategoryModule,CategoryModule,ProductModule,forwardRef(()=>UserContextModule)],
  exports: [OfferService],
})
export class OfferModule {}
