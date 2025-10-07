import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { GiftCategoryService } from './gift_category.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { GiftCategoryDto, GiftCategoryDtoWithMessage } from './dto/gift-category.dto';
import { CreateGiftCategoryDto } from './dto/action-gift-category.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { AdminGuard } from 'src/common/guards/roles/admin.guard';

@Controller('gift-category')
export class GiftCategoryController {
  constructor(private readonly giftCategoryService: GiftCategoryService) {}

  @ApiOperation({ summary: 'Create a Gift Category (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateGiftCategoryDto })
  @ApiResponse({ status: 201, description: 'Gift category created successfully', schema: { example: { message: 'Created successfully' } } })
  @Serilaize(GiftCategoryDtoWithMessage)
  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() body: CreateGiftCategoryDto, @I18n() i18n: I18nContext) {
    return this.giftCategoryService.create(body, getLang(i18n));
  }

  @ApiOperation({ summary: 'Update a gift category by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the gift category', example: 1 })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateGiftCategoryDto })
  @ApiResponse({ status: 201, description: 'Gift category updated successfully', schema: { example: { message: 'Updated successfully' } } })
  @Serilaize(GiftCategoryDto)
  @UseGuards(AdminGuard)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: CreateGiftCategoryDto, @I18n() i18n: I18nContext) {
    return this.giftCategoryService.update(id, body, getLang(i18n));
  }

  @ApiOperation({ summary: 'Get all Gift categories and their languages' })
  @ApiResponse({ status: 200, description: 'All gift categories', type: GiftCategoryDto, isArray: true })
  @Serilaize(GiftCategoryDto)
  @Get('with-templates')
  async findAllWithTemplates(@I18n() i18n: I18nContext) {
    return this.giftCategoryService.findAllWithTemplates(getLang(i18n));
  }

  @ApiOperation({ summary: 'Get all Gift categories with all languages (admin only)' })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'All gift categories', type: GiftCategoryDto, isArray: true })
  @Serilaize(GiftCategoryDto)
  @UseGuards(AdminGuard)
  @Get('admin/all')
  async findAllForAdmin() {
    return this.giftCategoryService.findAllForAdmin();
  }
}
