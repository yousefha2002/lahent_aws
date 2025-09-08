import { Module } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';
import { LoyaltySettingController } from './loyalty_setting.controller';
import { LoyaltySettingProvider } from './providers/loyalty_setting.provider';

@Module({
  controllers: [LoyaltySettingController],
  providers: [LoyaltySettingService,...LoyaltySettingProvider],
})
export class LoyaltySettingModule {}
