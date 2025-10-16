import { Controller, Get, Param, Post, Put, UploadedFile, UseFilters, UseInterceptors } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { multerOptions } from 'src/multer/multer.options';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { AvatarDto } from './dto/avatar.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { PermissionKey } from 'src/common/enums/permission-key';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CurrentUserType } from 'src/common/types/current-user.type';

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
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.CreateAvatar)
  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  createAvatar(
    @CurrentUser() user:CurrentUserType,
    @I18n() i18n: I18nContext,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const lang = getLang(i18n);
    const {actor} = user
    return this.avatarService.create(actor,lang, file);
  }

  @ApiOperation({ summary: 'Update an existing avatar (admin only)' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
    schema: { example: { message: 'Updated successfully' } },
  })
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateAvatar)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  async updateAvatar(
    @CurrentUser() user:CurrentUserType,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const lang = getLang(i18n);
    const {actor} = user
    return this.avatarService.update(+id,actor, lang, file);
  }
}