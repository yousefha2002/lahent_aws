import { Module } from '@nestjs/common';
import { OfferCategoryService } from './offer_category.service';
import { OfferCategoryController } from './offer_category.controller';
import { OfferCategoryProvider } from './providers/offer_category.provider';

@Module({
  controllers: [OfferCategoryController],
  providers: [OfferCategoryService,...OfferCategoryProvider],
  exports:[OfferCategoryService]
})
export class OfferCategoryModule {}
