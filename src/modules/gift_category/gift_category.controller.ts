import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { GiftCategoryService } from './gift_category.service';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { GiftCategoryDto, GiftCategoryDtoWithMessage } from './dto/gift-category.dto';
import { CreateGiftCategoryDto } from './dto/action-gift-category.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { getLang } from 'src/common/utils/get-lang.util';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { PermissionKey } from 'src/common/enums/permission-key';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('gift-category')
export class GiftCategoryController {
  constructor(private readonly giftCategoryService: GiftCategoryService) {}

  @ApiOperation({ summary: 'Create a Gift Category (admin only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateGiftCategoryDto })
  @ApiResponse({ status: 201, description: 'Gift category created successfully', schema: { example: { message: 'Created successfully' } } })
  @Serilaize(GiftCategoryDtoWithMessage)
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.CreateGiftCategory)
  @Post()
  async create(@Body() body: CreateGiftCategoryDto,@CurrentUser() user:CurrentUserType, @I18n() i18n: I18nContext) {
    const {actor} = user
    return this.giftCategoryService.create(body,actor, getLang(i18n));
  }

  @ApiOperation({ summary: 'Update a gift category by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'ID of the gift category', example: 1 })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateGiftCategoryDto })
  @ApiResponse({ status: 201, description: 'Gift category updated successfully', schema: { example: { message: 'Updated successfully' } } })
  @Serilaize(GiftCategoryDto)
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.UpdateGiftCategory)
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number,@CurrentUser() user:CurrentUserType, @Body() body: CreateGiftCategoryDto, @I18n() i18n: I18nContext) {
    const {actor} = user
    return this.giftCategoryService.update(id, body,actor, getLang(i18n));
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
  @PermissionGuard([RoleStatus.ADMIN],PermissionKey.ViewGiftCategory)
  @Get('admin/all')
  async findAllForAdmin() {
    return this.giftCategoryService.findAllForAdmin();
  }
}
