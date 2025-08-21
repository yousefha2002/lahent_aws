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
import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { Store } from '../store/entities/store.entity';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { multerOptions } from 'src/multer/multer.options';
import parseAndValidateExtraItems from 'src/common/validation/parseAndValidateExtraItem';
import parseAndValidateVariants from 'src/common/validation/parseAndValidateVariants';
import { variantType } from 'src/common/types/variant.type';
import { extraItemType } from 'src/common/types/extraItem.type';
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
    @Query('lang') lang=Language.en
  ) {
    const productImages = files
      .filter((f) => f.fieldname === 'images')

    if (productImages.length === 0) {
      throw new BadRequestException(
        'يجب إرسال صورة واحدة على الأقل للمنتج',
      );
    }

    if (productImages.length > 5) {
      throw new BadRequestException('يمكن رفع 5 صور فقط للمنتج');
    }
    // ✅ Manually parse & validate extraItems
    let extraItems: extraItemType[] = [];
    if (body.extraItems) {
      try {
        extraItems = parseAndValidateExtraItems(body.extraItems);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    const variantFilesWithIndex = files
      .filter(f => f.fieldname.startsWith('variantImage_'))
      .map(f => ({
        index: Number(f.fieldname.split('_')[1]),
        file: f, // ملف Multer كامل
      }));


    let variants: variantType[] = [];
    if (body.variants) {
      try {
        variants = parseAndValidateVariants(body.variants);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
    return this.productService.createProduct(
      store.id,
      body,
      productImages,
      extraItems,
      variants,
      variantFilesWithIndex,
      lang
    );
  }

  @Put('update/:productId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),
  )
  async updateProductWithImage(
    @Param('productId') productId: string,
    @Body() body: UpdateProductWithImageDto,
    @Query('lang') lang=Language.en,
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

  @Put('update/bycategory/:productId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  updateProductWithCategory(
    @Body() dto: UpdateProductWithIcategoryDto,
    @Param('productId') productId: string,
    @CurrentUser() store: Store,
  ) {
    return this.productService.updateProductWithCategory(
      +productId,
      dto,
      store.id,
    );
  }

  @Serilaize(PaginatedProductWithOfferDto)
  @Get('all/:storeId')
  async getCustomerStoreProducts(
    @Param('storeId') storeId: number,
    @Query('categoryId') categoryId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('name') name: string,
  ) {
    return this.productService.getCustomerStoreProducts(
      storeId,
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
  ) {
    return this.productService.getProductsByStore(
      store.id,
      +page,
      +limit,
      categoryId,
      name,
    );
  }

  @Serilaize(FullProductDetailsDto)
  @Get('/:productId')
  getFullProductDetails(@Param('productId') productId: number) {
    return this.productService.getFullProductDetails(productId);
  }

  @Put('active/:productId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  activeProduct(
    @Param('productId') productId: string,
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en
  ) {
    return this.productService.changeProductActivity(
      +productId,
      store.id,
      true,
      lang
    );
  }

  @Put('unactive/:productId')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  unactiveProduct(
    @Param('productId') productId: string,
    @CurrentUser() store: Store,
    @Query('lang') lang=Language.en
  ) {
    return this.productService.changeProductActivity(
      +productId,
      store.id,
      false,
      lang
    );
  }
}
