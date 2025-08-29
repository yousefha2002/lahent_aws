import { AdminEmailDto } from './dto/admin-email.dto';
import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
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

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @ApiOperation({ summary: 'Signup a new admin' })
  @ApiBody({ type: authAdminDto })
  @ApiQuery({ name: 'lang', enum: Language, required: false })
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
  async signupAdmin(@Body() body: authAdminDto,@Query('lang') lang=Language.ar) {
    const { email, password } = body;
    return this.adminService.signup(email, password,lang);
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
  async loginAdmin(@Body() body: authAdminDto,@Query('lang') lang=Language.ar) {
    const { email, password } = body;
    return this.adminService.login(email, password,lang);
  }

  @Serilaize(AdminDto)
  @Patch('email')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Change admin email' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AdminEmailDto })
  @ApiResponse({status: 200,type: AdminDto})
  changeAdminEmail(@Body() body: AdminEmailDto,@Query('lang') lang=Language.ar) {
    return this.adminService.changeEmail(body.newEmail,lang);
  }

  @Serilaize(AdminDto)
  @Patch('password')
  @ApiOperation({ summary: 'Change admin password' })
  @ApiSecurity('access-token')
  @ApiBody({ type: AdminPasswordDto })
  @ApiResponse({status: 200,type: AdminDto,})
  @UseGuards(AdminGuard)
  changeAdminPassword(@Body() body: AdminPasswordDto,@Query('lang') lang=Language.ar) {
    return this.adminService.changePassword(body,lang);
  }
}