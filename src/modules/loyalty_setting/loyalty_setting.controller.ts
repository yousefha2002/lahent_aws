import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { LoyaltySettingDto } from './dto/loyaltysetting.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateLoyaltySettingDto } from './dto/create_loyalty_setting.dto';
import { AdminGuard } from 'src/common/guards/roles/admin.guard';

@Controller('loyalty-setting')
export class LoyaltySettingController {
  constructor(private readonly loyaltySettingService: LoyaltySettingService) {}

  @Serilaize(LoyaltySettingDto)
  @ApiOperation({ summary: 'Get current loyalty settings' })
  @ApiResponse({
    status: 200,
    description: 'Current loyalty settings',
    type: LoyaltySettingDto,
  })
  @Get()
  async getSettings() {
    return this.loyaltySettingService.getSettings();
  }

  @UseGuards(AdminGuard)
  @Serilaize(LoyaltySettingDto)
  @ApiOperation({ summary: 'Create or update loyalty settings' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateLoyaltySettingDto })
  @ApiResponse({
    status: 201,
    description: 'Loyalty settings created or updated',
    type: LoyaltySettingDto,
  })
  @Post()
  async createOrUpdate(@Body() dto: CreateLoyaltySettingDto) {
    const { pointsPerCurrency, currencyPerPoint } = dto;
    return this.loyaltySettingService.createOrUpdate(pointsPerCurrency, currencyPerPoint);
  }
}
