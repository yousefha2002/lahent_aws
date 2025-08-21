import { Controller, Get, Post, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { multerOptions } from 'src/multer/multer.options';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Language } from 'src/common/enums/language';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}
  
  @Get()
  getAvatars() {
    return this.avatarService.findAll()
  }

  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  createAvatar(@Query('lang') lang=Language.en,@UploadedFile() file?: Express.Multer.File)
  {
    return this.avatarService.create(lang,file)
  }
}
