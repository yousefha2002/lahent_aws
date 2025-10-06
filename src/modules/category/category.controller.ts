import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApprovedStoreGuard } from 'src/common/guards/approved-store.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CategoryDto } from './dto/category.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { StoreGuard } from 'src/common/guards/store.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({status: 201, description: 'category created successfully', schema: {example: {message: 'Created successfully'}}})
  @UseGuards(StoreGuard, ApprovedStoreGuard)
  createCategory(
    @CurrentUser() store: Store,
    @Body() body: CreateCategoryDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.categoryService.create(store.id, body, lang);
  }

  @Put(':categoryId')
  @ApiOperation({ summary: 'Update a category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({status: 201, description: 'category updated successfully', schema: {example: {message: 'Updated successfully'}}})
  @UseGuards(StoreGuard, ApprovedStoreGuard)
  updateCategory(
    @Body() body: UpdateCategoryDto,
    @Param('categoryId') categoryId: string,
    @CurrentUser() store: Store,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.categoryService.update(+categoryId, store.id, body, lang);
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
  @UseGuards(StoreGuard, ApprovedStoreGuard)
  @ApiOperation({ summary: 'Delete a category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiResponse({status: 200, description: 'Category deleted successfully', schema: { example: { message: 'Deleted successfully' }}})
  deleteOne(
    @Param('categoryId') categoryId: string,
    @CurrentUser() store: Store,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.categoryService.deleteCategory(+categoryId, store.id, lang);
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