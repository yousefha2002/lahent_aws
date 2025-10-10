import { forwardRef, Module } from '@nestjs/common';
import { LoyaltyOfferService } from './loyalty_offer.service';
import { LoyaltyOfferController } from './loyalty_offer.controller';
import { LoyaltyOfferProvider } from './providers/loyalty_offer.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [LoyaltyOfferController],
  providers: [LoyaltyOfferService,...LoyaltyOfferProvider],
  imports:[forwardRef(()=>UserContextModule)],
  exports:[LoyaltyOfferService]
})
export class LoyaltyOfferModule {}
