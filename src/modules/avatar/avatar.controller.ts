import { Controller, Get, Post, Query, Req, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { multerOptions } from 'src/multer/multer.options';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Language } from 'src/common/enums/language';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AvatarDto } from './dto/avatar.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}
  
  @ApiOperation({ summary: 'Get list of avatars' })
  @ApiResponse({status: 200,description: 'List of avatars',type: AvatarDto,isArray: true})
  @Serilaize(AvatarDto)
  @Get()
  getAvatars() {
    return this.avatarService.findAll()
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
        }
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar created successfully',
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  createAvatar( @Req() req,@UploadedFile() file?: Express.Multer.File)
  {
    return this.avatarService.create(req.lang,file)
  }
}
