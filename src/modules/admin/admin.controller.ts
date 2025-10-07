import { 
  Body,
  Controller,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { authAdminDto } from './dto/auth-admin.dto';
import { AdminDto } from './dto/admin.dto';
import { AdminEmailDto } from './dto/admin-email.dto';
import { AdminPasswordDto } from './dto/admin-password.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { AdminGuard } from 'src/common/guards/roles/admin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  async signupAdmin(
    @Body() body: authAdminDto,
    @I18n() i18n: I18nContext,
  ) {
    const { email, password } = body;
    const lang = getLang(i18n);
    return this.adminService.signup(email, password, lang);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as admin' })
  @ApiBody({ type: authAdminDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        admin: { id: 1, email: 'admin@example.com' },
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  async loginAdmin(
    @Body() body: authAdminDto,
    @I18n() i18n: I18nContext,
  ) {
    const { email, password } = body;
    const lang = getLang(i18n);
    return this.adminService.login(email, password, lang);
  }

  @Serilaize(AdminDto)
  @Patch('email')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Change admin email' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AdminEmailDto })
  @ApiResponse({ status: 200, type: AdminDto })
  changeAdminEmail(
    @Body() body: AdminEmailDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.adminService.changeEmail(body.newEmail, lang);
  }

  @Serilaize(AdminDto)
  @Patch('password')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Change admin password' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AdminPasswordDto })
  @ApiResponse({ status: 200, type: AdminDto })
  changeAdminPassword(
    @Body() body: AdminPasswordDto,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.adminService.changePassword(body, lang);
  }
}