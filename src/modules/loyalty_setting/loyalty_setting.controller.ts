import { Controller } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';

@Controller('loyalty-setting')
export class LoyaltySettingController {
  constructor(private readonly loyaltySettingService: LoyaltySettingService) {}
}
