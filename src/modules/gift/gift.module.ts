import { forwardRef, Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { GiftTemplateModule } from '../gift_template/gift_template.module';
import { GiftProvider } from './providers/gift.provider';
import { CustomerModule } from '../customer/customer.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  controllers: [GiftController],
  providers: [GiftService, ...GiftProvider],
  imports: [
    GiftTemplateModule,
    forwardRef(() => TransactionModule),
    forwardRef(() => CustomerModule),
  ],
  exports: [GiftService],
})
export class GiftModule {}
