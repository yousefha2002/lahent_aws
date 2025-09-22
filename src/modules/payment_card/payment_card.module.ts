import { Module } from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';
import { PaymentCardController } from './payment_card.controller';
import { PaymentCardProvider } from './providers/payment_card.provider';

@Module({
  controllers: [PaymentCardController],
  providers: [PaymentCardService,...PaymentCardProvider],
})
export class PaymentCardModule {}
