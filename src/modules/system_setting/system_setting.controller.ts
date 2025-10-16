import { Body, Controller, Get, Post } from '@nestjs/common';
import { SystemSettingService } from './system_setting.service';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { PermissionKey } from 'src/common/enums/permission-key';
import { SystemSettingDto } from './dto/system-setting.dto';
import { RoleStatus } from 'src/common/enums/role_status';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';

@Controller('system-setting')
export class SystemSettingController {
  constructor(private readonly systemSettingService: SystemSettingService) {}

  @Serilaize(SystemSettingDto)
  @ApiOperation({ summary: 'Get current system settings' })
  @ApiResponse({
    status: 200,
    description: 'Current system settings',
    type: SystemSettingDto,
  })
  @Get()
  async getSettings() {
    return this.systemSettingService.getSettings();
  }

  @PermissionGuard([RoleStatus.ADMIN], PermissionKey.SystemSettings)
  @Serilaize(SystemSettingDto)
  @ApiOperation({ summary: 'Create or update system settings' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateSystemSettingDto })
  @ApiResponse({
    status: 201,
    description: 'System settings created or updated',
    type: SystemSettingDto,
  })
  @Post()
  async createOrUpdate(@Body() dto: CreateSystemSettingDto, @CurrentUser() user: CurrentUserType) {
    const { actor } = user;
    return this.systemSettingService.createOrUpdate(dto, actor);
  }
}
