import {forwardRef, Module } from '@nestjs/common';
import { PaymentSessionService } from './payment_session.service';
import { PaymentSessionController } from './payment_session.controller';
import { PaymentSessionProvider } from './providers/payment_session.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [PaymentSessionController],
  providers: [PaymentSessionService,...PaymentSessionProvider],
  exports:[PaymentSessionService],
  imports:[forwardRef(()=>UserContextModule)]
})
export class PaymentSessionModule {}
