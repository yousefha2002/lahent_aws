import { AdminEmailDto } from './dto/admin-email.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { authAdminDto } from './dto/auth-admin.dto';
import { AdminDto } from './dto/admin.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AdminPasswordDto } from './dto/admin-password.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { Language } from 'src/common/enums/language';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('signup')
  async signupAdmin(@Body() body: authAdminDto,@Query('lang') lang=Language.en) {
    const { email, password } = body;
    return this.adminService.signup(email, password,lang);
  }

  @Post('login')
  async loginAdmin(@Body() body: authAdminDto,@Query('lang') lang=Language.en) {
    const { email, password } = body;
    return this.adminService.login(email, password,lang);
  }

  @Serilaize(AdminDto)
  @Patch('email')
  @UseGuards(AdminGuard)
  changeAdminEmail(@Body() body: AdminEmailDto,@Query('lang') lang=Language.en) {
    return this.adminService.changeEmail(body.newEmail,lang);
  }

  @Serilaize(AdminDto)
  @Patch('password')
  @UseGuards(AdminGuard)
  changeAdminPassword(@Body() body: AdminPasswordDto,@Query('lang') lang=Language.en) {
    return this.adminService.changePassword(body,lang);
  }

}
