import { Module } from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';
import { PaymentCardController } from './payment_card.controller';
import { PaymentCardProvider } from './providers/payment_card.provider';
import { CustomerModule } from '../customer/customer.module';

@Module({
  controllers: [PaymentCardController],
  providers: [PaymentCardService,...PaymentCardProvider],
  imports:[CustomerModule]
})
export class PaymentCardModule {}
