import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateTypeDto } from './dto/create-type.dto';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { multerOptions } from 'src/multer/multer.options';
import { FileInterceptor } from '@nestjs/platform-express';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { TypeDto } from './dto/type.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('type')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @ApiOperation({ summary: 'Create a new type with icon (admin only)' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nameEn: { type: 'string', example: 'store' },
        nameAr: { type: 'string', example: 'متجر' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['nameEn', 'nameAr', 'image'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Type created successfully',
    schema: {
      example: {
        message: 'Created successfully',
      },
    },
  })
  @Post('create')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  createType(
    @I18n() i18n: I18nContext,
    @Body() dto: CreateTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('upload icon is required');
    }
    const lang = getLang(i18n);
    return this.typeService.createType(dto, file, lang);
  }

  @ApiOperation({ summary: 'Update type by ID (admin only)' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'typeId', description: 'ID of the type to update', example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nameEn: { type: 'string', example: 'electronic' },
        nameAr: { type: 'string', example: 'الكترونيات' },
        image: { type: 'string', format: 'binary', nullable: true },
      },
      required: ['nameEn', 'nameAr'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Type updated successfully',
    schema: {
      example: { message: 'Updated successfully' },
    },
  })
  @Put('update/:typeId')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  updateType(
    @I18n() i18n: I18nContext,
    @Param('typeId') typeId: string,
    @Body() dto: CreateTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const lang = getLang(i18n);
    return this.typeService.updateType(+typeId, dto, lang, file);
  }

  @ApiOperation({ summary: 'Delete a type by ID (admin only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'typeId', description: 'ID of the type to delete', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Type deleted successfully',
    schema: { example: { message: 'Deleted successfully' } },
  })
  @Delete(':typeId')
  @UseGuards(AdminGuard)
  deleteType(
    @Param('typeId') typeId: string,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.typeService.deleteType(+typeId,lang);
  }

  @ApiOperation({ summary: 'Get all types with their languages' })
  @ApiResponse({ status: 200, description: 'List of types', type: [TypeDto] })
  @Get('all')
  @Serilaize(TypeDto)
  getAllTypes(@I18n() i18n: I18nContext) {
    const lang = getLang(i18n);
    return this.typeService.getAllTypes(lang);
  }

  @ApiOperation({ summary: 'Get a single type by ID with its languages' })
  @ApiParam({ name: 'typeId', description: 'ID of the type', example: 1 })
  @ApiResponse({ status: 200, description: 'Type details', type: TypeDto })
  @Get(':typeId')
  @Serilaize(TypeDto)
  getOne(
    @Param('typeId') typeId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.typeService.getOneType(+typeId, lang);
  }
}
