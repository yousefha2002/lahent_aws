import { Body,Controller,Patch,Post,UseGuards} from '@nestjs/common';
import { AdminService } from './admin.service';
import { authAdminDto } from './dto/auth-admin.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

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
}