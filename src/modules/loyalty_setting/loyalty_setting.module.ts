import { Module } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';
import { LoyaltySettingController } from './loyalty_setting.controller';
import { LoyaltySettingProvider } from './providers/loyalty_setting.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [LoyaltySettingController],
  providers: [LoyaltySettingService,...LoyaltySettingProvider],
  imports:[AdminModule]
})
export class LoyaltySettingModule {}
