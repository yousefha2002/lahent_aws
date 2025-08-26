import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from '../store/entities/store.entity';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateProductDto, ProductLanguageDto } from './dto/create-product.dto';
import { multerOptions } from 'src/multer/multer.options';
import { UpdateProductWithImageDto } from './dto/update-product-withImage.dto';
import {
  ExistingImage,
  parseAndValidateExistingImages,
} from 'src/common/validation/parseAndValidateExistingImages';
import { UpdateProductWithIcategoryDto } from './dto/update-product-withCategory.dto';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedProductWithOfferDto } from './dto/productwithoffer.dto';
import { PaginatedSimpleProductDto } from './dto/product-for-store.dto';
import { FullProductDetailsDto } from './dto/full-product-with-details.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { Language } from 'src/common/enums/language';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async create(
    @CurrentUser() store: Store,
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('lang') lang = Language.en,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('يجب إرسال صورة واحدة على الأقل للمنتج');
    }
    if (files.length > 5) {
      throw new BadRequestException('يمكن رفع 5 صور فقط للمنتج');
    }
    return this.productService.createProduct(store.id, body, files, lang);
  }

  @Put('update/:productId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),
  )
  async updateProductWithImage(
    @Param('productId') productId: string,
    @Body() body: UpdateProductWithImageDto,
    @Query('lang') lang = Language.en,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    let existingImages: ExistingImage[] = [];
    try {
      existingImages = parseAndValidateExistingImages(body.existingImages);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const images = files.images || [];
    return this.productService.updateProductWithImages(
      +productId,
      body,
      lang,
      existingImages,
      images,
    );
  }

  @Serilaize(PaginatedProductWithOfferDto)
  @Get('all/:storeId')
  async getCustomerStoreProducts(
    @Param('storeId') storeId: number,
    @Query('categoryId') categoryId: number,
    @Query('lang') lang=Language.ar,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
  ) {
    return this.productService.getCustomerStoreProducts(
      storeId,
      lang,
      +page,
      +limit,
      categoryId,
      name,
    );
  }

  @Serilaize(PaginatedSimpleProductDto)
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Get('all')
  async getProductsByStore(
    @CurrentUser() store: Store,
    @Query('categoryId') categoryId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
    @Query('lang') lang = Language.ar
  ) {
    return this.productService.getProductsByStore(
      store.id,
      lang,
      +page,
      +limit,
      categoryId,
      name,
    );
  }

  @Serilaize(FullProductDetailsDto)
  @Get('/:productId')
  getFullProductDetails(@Param('productId') productId: string,@Query('lang') lang=Language.ar,) {
    return this.productService.getFullProductDetails(+productId,lang);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(FullProductDetailsDto)
  @Get('/:productId/byStore')
  getFullProductDetailsForStore(@Param('productId') productId: string,@Query('lang') lang=Language.ar,) {
    return this.productService.getFullProductDetails(+productId,lang,{ includeInactive: true });
  }

  @Put('active/:productId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  activeProduct(
    @Param('productId') productId: string,
    @CurrentUser() store: Store,
    @Query('lang') lang = Language.en,
  ) {
    return this.productService.changeProductActivity(
      +productId,
      store.id,
      lang,
    );
  }
}
