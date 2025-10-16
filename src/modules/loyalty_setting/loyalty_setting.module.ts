import { forwardRef, Module } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';
import { LoyaltySettingController } from './loyalty_setting.controller';
import { LoyaltySettingProvider } from './providers/loyalty_setting.provider';
import { UserContextModule } from '../user-context/user-context.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  controllers: [LoyaltySettingController],
  providers: [LoyaltySettingService,...LoyaltySettingProvider],
  imports:[forwardRef(()=>UserContextModule),AuditLogModule],
  exports:[LoyaltySettingService]
})
export class LoyaltySettingModule {}
