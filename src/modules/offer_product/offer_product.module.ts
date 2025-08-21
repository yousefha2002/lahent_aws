import {Module } from '@nestjs/common';
import { OfferProductService } from './offer_product.service';
import { OfferProductController } from './offer_product.controller';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { OfferProductProvider } from './providers/offer_product.provider';

@Module({
  controllers: [OfferProductController],
  providers: [OfferProductService, ...OfferProductProvider],
  imports: [StoreModule, OwnerModule],
  exports:[OfferProductService]
})
export class OfferProductModule {}
