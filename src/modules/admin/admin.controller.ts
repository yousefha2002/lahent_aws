import {Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { CreateAdminDto } from './dto/create-admin.dto';
import { PaginatedAdminsResponseDto } from './dto/admin-list.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminWithPermissionsDto } from './dto/admin-permissions.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionKey } from 'src/common/enums/permission-key';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-super-admin')
  async createSuperAdmin() {
    return this.adminService.createSuperAdmin();
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({type:RefreshTokenDto})
  @ApiResponse({
    status: 200,
    description: 'New access token returned successfully',
    schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',refreshToken:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } },
  })
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.adminService.refreshToken(dto);
  }

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Create a new admin (admin only)' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiBody({type:CreateAdminDto})
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.CreateAdmin)
  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }

  @Serilaize(PaginatedAdminsResponseDto)
  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get all admins with roles (excluding super admin)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, type: PaginatedAdminsResponseDto })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewAdmin)
  @Get()
  async getAllAdmins(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    return this.adminService.getAllAdmins(pageNum, limitNum);
  }

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Update an admin (exclude super admin)' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateAdmin)
  @Put(':id')
  async updateAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
  ) {
    return this.adminService.updateAdmin(id, dto);
  }

  @ApiSecurity('access-token')
  @ApiOperation({ summary: 'Get admin with permissions' })
  @ApiResponse({ status: 200, type: AdminWithPermissionsDto })
  @PermissionGuard([RoleStatus.ADMIN])
  @Get('permissions')
  async getAdminPermissions(@CurrentUser() user: CurrentUserType) {
    const {actor} = user
    return this.adminService.getAdminWithPermissions(actor.id);
  }
}