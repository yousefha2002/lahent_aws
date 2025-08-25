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
import { ApiBody, ApiQuery } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @ApiBody({ type: authAdminDto })
  @ApiQuery({ name: 'lang', enum: Language, required: false })
  @Post('signup')
  async signupAdmin(@Body() body: authAdminDto,@Query('lang') lang=Language.ar) {
    const { email, password } = body;
    return this.adminService.signup(email, password,lang);
  }

  @Post('login')
  async loginAdmin(@Body() body: authAdminDto,@Query('lang') lang=Language.ar) {
    const { email, password } = body;
    return this.adminService.login(email, password,lang);
  }

  @Serilaize(AdminDto)
  @Patch('email')
  @UseGuards(AdminGuard)
  changeAdminEmail(@Body() body: AdminEmailDto,@Query('lang') lang=Language.ar) {
    return this.adminService.changeEmail(body.newEmail,lang);
  }

  @Serilaize(AdminDto)
  @Patch('password')
  @UseGuards(AdminGuard)
  changeAdminPassword(@Body() body: AdminPasswordDto,@Query('lang') lang=Language.ar) {
    return this.adminService.changePassword(body,lang);
  }

}
