import { PaymentSessionModule } from './../payment_session/payment_session.module';
import { forwardRef, Module } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionProvider } from './proivders/transaction.provider';
import { LoyaltyOfferModule } from '../loyalty_offer/loyalty_offer.module';
import { CustomerModule } from '../customer/customer.module';
import { GiftModule } from '../gift/gift.module';
import { PaymentCardModule } from '../payment_card/payment_card.module';
import { UserContextModule } from '../user-context/user-context.module';
import { WalletService } from './services/wallet.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, ...TransactionProvider,WalletService],
  imports: [
    LoyaltyOfferModule,
    forwardRef(() => CustomerModule),
    forwardRef(() => UserContextModule),
    PaymentSessionModule,
    forwardRef(() => GiftModule),
    forwardRef(()=>PaymentCardModule)
  ],
  exports: [TransactionService,WalletService],
})
export class TransactionModule {}
