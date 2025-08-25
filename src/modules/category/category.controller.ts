import {Body,Controller,Delete,Get,Param,Post,Put,Query,UseGuards,} from '@nestjs/common';
import { CategoryService } from './category.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CategoryDto } from './dto/category.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { Language } from 'src/common/enums/language';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@ApiQuery({ name: 'lang', enum: Language, required: false, example: 'ar' })
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCategoryDto })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiResponse({status: 201,description: 'category created successfully',schema: {example: {message: 'Created successfully'}}})
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  createCategory(@CurrentUser() store: Store, @Body() body: CreateCategoryDto,@Query('lang') lang=Language.en) {
    console.log(body)
    return this.categoryService.create(store.id, body,lang);
  }

  @Put(':categoryId')
  @ApiOperation({ summary: 'Update a category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({status: 201,description: 'category updated successfully',schema: {example: {message: 'Updated successfully'}}})
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  updateCategory(
    @Body() body: UpdateCategoryDto,
    @Param('categoryId') categoryId: string,
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en
  ) {
    return this.categoryService.update(+categoryId,store.id,body,lang=Language.ar);
  }

  @Get('/:categoryId')
  @Serilaize(CategoryDto)
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiResponse({ status: 200, description: 'Category details', type: CategoryDto })
  getOne(@Param('categoryId') categoryId: string,@Query('lang') lang=Language.en) {
    return this.categoryService.categoryById(categoryId,lang);
  }

  @Delete('/:categoryId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @ApiOperation({ summary: 'Delete a category (store or owner only)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'categoryId', example: 1 })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiResponse({status: 200,description: 'Category deleted successfully',schema: { example: { message: 'Deleted successfully' }}})
  deleteOne(
    @Param('categoryId') categoryId: string,
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en
  ) {
    return this.categoryService.deleteCategory(+categoryId, store.id,lang);
  }

  @Get('/all/:storeId')
  @ApiOperation({ summary: 'Get all categories of a store with product counts' })
  @ApiParam({ name: 'storeId', example: 1 })
  @ApiResponse({status: 200,description: 'List of categories',type: [CategoryDto]})
  @Serilaize(CategoryDto)
  getCategoriesWithProductCount(@Param('storeId') storeId: string,@Query('lang') lang=Language.ar) {
    return this.categoryService.getCategoriesWithProductCount(+storeId,lang);
  }
}
