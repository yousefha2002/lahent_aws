import { PaymentSessionModule } from './../payment_session/payment_session.module';
import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionProvider } from './proivders/transaction.provider';
import { LoyaltyOfferModule } from '../loyalty_offer/loyalty_offer.module';
import { CustomerModule } from '../customer/customer.module';
import { GiftModule } from '../gift/gift.module';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, ...TransactionProvider],
  imports: [
    LoyaltyOfferModule,
    forwardRef(() => CustomerModule),
    PaymentSessionModule,
    forwardRef(() => GiftModule),
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
