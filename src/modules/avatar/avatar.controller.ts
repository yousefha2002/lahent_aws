import { 
  Controller, 
  Get, 
  Post, 
  Req, 
  UploadedFile, 
  UseFilters, 
  UseGuards, 
  UseInterceptors 
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { multerOptions } from 'src/multer/multer.options';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AvatarDto } from './dto/avatar.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @ApiOperation({ summary: 'Get list of avatars' })
  @ApiResponse({
    status: 200,
    description: 'List of avatars',
    type: AvatarDto,
    isArray: true,
  })
  @Serilaize(AvatarDto)
  @Get()
  getAvatars() {
    return this.avatarService.findAll();
  }

  @ApiOperation({ summary: 'Create a new avatar (admin only)' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar created successfully',
    schema: {
      example: { message: 'Created successfully' },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  createAvatar(
    @I18n() i18n: I18nContext,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const lang = getLang(i18n);
    return this.avatarService.create(lang, file);
  }

  @Get('test')
  checkHeaders(@Req() req: Request) {
    console.log(req.headers);
    return req.headers;
  }
}