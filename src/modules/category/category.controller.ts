import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
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

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  createCategory(@CurrentUser() store: Store, @Body() body: CreateCategoryDto,@Query('lang') lang=Language.en) {
    return this.categoryService.create(store.id, body,lang);
  }

  @Put(':categoryId')
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
  getOne(@Param('categoryId') categoryId: string,@Query('lang') lang=Language.en) {
    return this.categoryService.categoryById(categoryId,lang);
  }

  @Delete('/:categoryId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  deleteOne(
    @Param('categoryId') categoryId: string,
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en
  ) {
    return this.categoryService.deleteCategory(+categoryId, store.id,lang);
  }

  @Get('/all/:storeId')
  @Serilaize(CategoryDto)
  getCategoriesWithProductCount(@Param('storeId') storeId: string,@Query('lang') lang=Language.ar) {
    return this.categoryService.getCategoriesWithProductCount(+storeId,lang);
  }
}
