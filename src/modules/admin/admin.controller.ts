import {Body, Controller, Post} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshTokenDto } from '../user_token/dtos/refreshToken.dto';

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
}