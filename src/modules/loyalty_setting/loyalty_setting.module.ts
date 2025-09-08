import { Module } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';
import { LoyaltySettingController } from './loyalty_setting.controller';

@Module({
  controllers: [LoyaltySettingController],
  providers: [LoyaltySettingService],
})
export class LoyaltySettingModule {}
