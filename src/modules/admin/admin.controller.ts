import { AdminEmailDto } from './dto/admin-email.dto';
import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { authAdminDto } from './dto/auth-admin.dto';
import { AdminDto } from './dto/admin.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AdminPasswordDto } from './dto/admin-password.dto';
import { Language } from 'src/common/enums/language';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @ApiOperation({ summary: 'Signup a new admin' })
  @ApiBody({ type: authAdminDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        admin: { id: 1, email: 'admin@example.com' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @Post('signup')
  async signupAdmin(@Body() body: authAdminDto, @Req() req) {
    const { email, password } = body;
    return this.adminService.signup(email, password,req.lang);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as admin' })
  @ApiBody({ type: authAdminDto })
  @ApiQuery({ name: 'lang', enum: Language, required: false })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        admin: { id: 1, email: 'admin@example.com' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async loginAdmin(@Body() body: authAdminDto, @Req() req) {
    const { email, password } = body;
    return this.adminService.login(email, password,req.lang);
  }

  @Serilaize(AdminDto)
  @Patch('email')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Change admin email' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AdminEmailDto })
  @ApiResponse({status: 200,type: AdminDto})
  changeAdminEmail(@Body() body: AdminEmailDto, @Req() req) {
    return this.adminService.changeEmail(body.newEmail,req.lang);
  }

  @Serilaize(AdminDto)
  @Patch('password')
  @ApiOperation({ summary: 'Change admin password' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AdminPasswordDto })
  @ApiResponse({status: 200,type: AdminDto,})
  @UseGuards(AdminGuard)
  changeAdminPassword(@Body() body: AdminPasswordDto, @Req() req) {
    return this.adminService.changePassword(body,req.lang);
  }
}