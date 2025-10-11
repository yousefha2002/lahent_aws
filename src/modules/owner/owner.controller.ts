import { Body, Controller, Get, Post, Put, Query, Req } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { UpdateOwnerDto } from './dto/updateOwner.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { OwnerDto, PaginationOwnerDto } from './dto/owner.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @ApiOperation({ summary: 'Update current owner profile' })
  @ApiSecurity('access-token')
  @ApiBody({ type: UpdateOwnerDto })
  @ApiResponse({
    status: 200,
    description: 'Owner profile updated successfully with message',
    type: OwnerDto,
  })
  @Serilaize(OwnerDto)
  @PermissionGuard([RoleStatus.OWNER,RoleStatus.ADMIN])
  @Put()
  async updateOwner(
    @Body() body: UpdateOwnerDto,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.ownerService.updateOwnerProfile(context.id, body, lang);
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({type:RefreshTokenDto})
  @ApiResponse({
    status: 200,
    description: 'New access token returned successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @Post('refresh-token')
  async refreshToken(@Body() dto:RefreshTokenDto,@Req() req: Request) {
    const device = req.headers['user-agent'] || 'unknown';
    return this.ownerService.refreshToken(dto,device);
  }

  @ApiOperation({ summary: 'Get current owner profile' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'Current owner profile returned successfully',
    type: OwnerDto,
  })
  @Serilaize(OwnerDto)
  @PermissionGuard([RoleStatus.OWNER,RoleStatus.ADMIN])
  @Get('current')
  getCurrentOwner(@CurrentUser() user:CurrentUserType)
  {
    const {context} = user
    return context
  }

  @ApiOperation({ summary: 'Get all owners (Admin only) with pagination' })
  @ApiSecurity('access-token')
  @ApiResponse({status: 200,type: PaginationOwnerDto})
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by store name' })
  @ApiQuery({ name: 'city', required: false, type: String, description: 'Filter by city' })
  @ApiQuery({ name: 'phone', required: false, type: String, description: 'Filter by phone' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email' })
  @Serilaize(PaginationOwnerDto)
  @PermissionGuard([RoleStatus.ADMIN])
  @Get('all')
  async getAllOwners(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('name') name?: string,
    @Query('city') city?: string,
    @Query('phone') phone?: string,
    @Query('email') email?: string)
  {
    return this.ownerService.findAll(page, limit,name,city,phone,email);
  }
}