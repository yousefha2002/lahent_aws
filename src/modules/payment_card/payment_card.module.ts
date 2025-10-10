import { forwardRef, Module } from '@nestjs/common';
import { PaymentCardService } from './payment_card.service';
import { PaymentCardController } from './payment_card.controller';
import { PaymentCardProvider } from './providers/payment_card.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [PaymentCardController],
  providers: [PaymentCardService,...PaymentCardProvider],
  imports:[forwardRef(() => UserContextModule)],
  exports:[PaymentCardService]
})
export class PaymentCardModule {}
