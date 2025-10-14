import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoyaltySettingService } from './loyalty_setting.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { LoyaltySettingDto } from './dto/loyaltysetting.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateLoyaltySettingDto } from './dto/create_loyalty_setting.dto';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

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

  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.SystemPoints)
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
    return this.loyaltySettingService.createOrUpdate(dto);
  }
}
