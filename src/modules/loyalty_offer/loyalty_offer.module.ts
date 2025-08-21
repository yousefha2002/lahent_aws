import { Module } from '@nestjs/common';
import { LoyaltyOfferService } from './loyalty_offer.service';
import { LoyaltyOfferController } from './loyalty_offer.controller';
import { LoyaltyOfferProvider } from './providers/loyalty_offer.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [LoyaltyOfferController],
  providers: [LoyaltyOfferService,...LoyaltyOfferProvider],
  imports:[AdminModule],
  exports:[LoyaltyOfferService]
})
export class LoyaltyOfferModule {}
