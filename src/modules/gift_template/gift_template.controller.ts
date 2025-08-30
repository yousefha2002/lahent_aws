import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GiftTemplateService } from './gift_template.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateGiftTemplateDto } from './dto/create-gift-template.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { GiftTemplateDto, PaginatedGiftTemplateDto } from './dto/gift-template.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('gift-template')
export class GiftTemplateController {
  constructor(private readonly giftTemplateService: GiftTemplateService) {}

  @ApiOperation({ summary: 'Create a Gift Template (admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateGiftTemplateDto })
  @ApiResponse({ status: 201, description: 'Gift template created successfully', schema: { example: { message: 'Created successfully' } } })
  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateGiftTemplateDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.giftTemplateService.create(body, file, getLang(i18n));
  }

  @ApiOperation({ summary: 'Update a Gift Template by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the gift template', example: 1 })
  @ApiConsumes('multipart/form-data')
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateGiftTemplateDto })
  @ApiResponse({ status: 201, description: 'Gift template updated successfully', schema: { example: { message: 'Updated successfully' } } })
  @Serilaize(GiftTemplateDto)
  @UseGuards(AdminGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateGiftTemplateDto,
    @UploadedFile() file: Express.Multer.File,
    @I18n() i18n: I18nContext,
  ) {
    return this.giftTemplateService.update(body, id, getLang(i18n), file);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOperation({ summary: 'Get all gift templates by gift categoryId' })
  @ApiParam({ name: 'categoryId', description: 'ID of the gift category', example: 1 })
  @ApiResponse({ status: 200, description: 'All gift templates by gift category', type: PaginatedGiftTemplateDto })
  @Serilaize(PaginatedGiftTemplateDto)
  @Get('by-category/:categoryId')
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.giftTemplateService.findByCategoryWithPagination(
      +categoryId,
      +page,
      +limit,
    );
  }
}