import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CategoryDto } from './dto/category.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { StoreOrAdminGuard } from 'src/common/guards/roles/store-or-admin-guard';
import { CurrentUserType } from 'src/common/types/current-user.type';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCategoryDto })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({status: 201, description: 'category created successfully', schema: {example: {message: 'Created successfully'}}})
  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  createCategory(
    @CurrentUser() user: CurrentUserType,
    @Body() body: CreateCategoryDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.categoryService.create(context.id, body, lang);
  }

  @Put(':categoryId')
  @ApiOperation({ summary: 'Update a category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({status: 201, description: 'category updated successfully', schema: {example: {message: 'Updated successfully'}}})
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  updateCategory(
    @Body() body: UpdateCategoryDto,
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.categoryService.update(+categoryId, context.id, body, lang);
  }

  @Get('/:categoryId')
  @Serilaize(CategoryDto)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryDto })
  getOne(
    @Param('categoryId') categoryId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.categoryService.categoryById(categoryId, lang);
  }

  @Delete('/:categoryId')
  @UseGuards(StoreOrAdminGuard, ApprovedStoreGuard)
  @ApiOperation({ summary: 'Delete a category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({status: 200, description: 'Category deleted successfully', schema: { example: { message: 'Deleted successfully' }}})
  deleteOne(
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.categoryService.deleteCategory(+categoryId, context.id, lang);
  }

  @Get('/all/:storeId')
  @ApiOperation({ summary: 'Get all categories of a store with product counts' })
  @ApiParam({ name: 'storeId', example: 1 })
  @ApiResponse({status: 200, description: 'List of categories', type: [CategoryDto]})
  @Serilaize(CategoryDto)
  getCategoriesWithProductCount(
    @Param('storeId') storeId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.categoryService.getCategoriesWithProductCount(+storeId, lang);
  }
}