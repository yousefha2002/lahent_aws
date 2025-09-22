import { Module } from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';
import { PaymentCardController } from './payment_card.controller';

@Module({
  controllers: [PaymentCardController],
  providers: [PaymentCardService],
})
export class PaymentCardModule {}
