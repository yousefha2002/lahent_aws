import { forwardRef, Module } from '@nestjs/common';
import { GiftService } from './gift.service';
import { GiftController } from './gift.controller';
import { GiftTemplateModule } from '../gift_template/gift_template.module';
import { GiftProvider } from './providers/gift.provider';
import { CustomerModule } from '../customer/customer.module';
import { TransactionModule } from '../transaction/transaction.module';
import { FcmTokenModule } from '../fcm_token/fcm_token.module';
import { SmsModule } from '../sms/sms.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  controllers: [GiftController],
  providers: [GiftService, ...GiftProvider],
  imports: [
    GiftTemplateModule,
    forwardRef(() => TransactionModule),
    forwardRef(() => CustomerModule),
    forwardRef(()=>UserContextModule),
    FcmTokenModule,
    SmsModule,
    DatabaseModule,
    AuditLogModule
  ],
  exports: [GiftService],
})
export class GiftModule {}
