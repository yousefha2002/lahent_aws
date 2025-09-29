import { forwardRef, Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { GiftTemplateModule } from '../gift_template/gift_template.module';
import { GiftProvider } from './providers/gift.provider';
import { CustomerModule } from '../customer/customer.module';
import { TransactionModule } from '../transaction/transaction.module';
import { FcmTokenModule } from '../fcm_token/fcm_token.module';

@Module({
  controllers: [GiftController],
  providers: [GiftService, ...GiftProvider],
  imports: [
    GiftTemplateModule,
    forwardRef(() => TransactionModule),
    forwardRef(() => CustomerModule),
    FcmTokenModule
  ],
  exports: [GiftService],
})
export class GiftModule {}
