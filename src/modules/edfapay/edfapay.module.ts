import { Module } from '@nestjs/common';
import { EdfapayService } from './edfapay.service';
import { EdfapayController } from './edfapay.controller';
import { PaymentSessionModule } from '../payment_session/payment_session.module';
import { OrderModule } from '../order/order.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  controllers: [EdfapayController],
  providers: [EdfapayService],
  imports:[PaymentSessionModule,OrderModule,TransactionModule]
})
export class EdfapayModule {}
