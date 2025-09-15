import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { CreateProductDto } from './dto/create-product.dto';
import { multerOptions } from 'src/multer/multer.options';
import { UpdateProductWithImageDto } from './dto/update-product-withImage.dto';
import {
  ExistingImage,
  parseAndValidateExistingImages,
} from 'src/common/validation/parseAndValidateExistingImages';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedProductWithOfferDto } from './dto/productwithoffer.dto';
import { PaginatedSimpleProductDto } from './dto/product-for-store.dto';
import { FullProductDetailsDto, fullProductDetailsWihtPrivateDetails } from './dto/full-product-with-details.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { TopProductResponseDto } from './dto/top-product-response.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new product with images and languages' })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiSecurity('access-token')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string', example: '1' },
        basePrice: { type: 'string', example: '100' },
        preparationTime: { type: 'string', example: '15' },
        languages: {
          type: 'string',
          example: JSON.stringify([
            { languageCode: 'en', name: 'My Product', shortDescription: 'Short desc', longDescription: 'Long desc' },
            { languageCode: 'ar', name: 'منتجي', shortDescription: 'وصف قصير', longDescription: 'وصف طويل' },
          ]),
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload 1 to 5 product images',
        },
      },
      required: ['categoryId','basePrice','preparationTime','languages','images'],
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'Product created successfully',
        productId: 123
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async create(
    @CurrentUser() store: Store,
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @I18n() i18n: I18nContext,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('يجب إرسال صورة واحدة على الأقل للمنتج');
    }
    if (files.length > 5) {
      throw new BadRequestException('يمكن رفع 5 صور فقط للمنتج');
    }
    const lang = getLang(i18n);
    return this.productService.createProduct(store.id, body, files, lang);
  }

  @Put('update/:productId')
  @ApiOperation({ summary: 'Update product details with images and languages' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'productId', example: 101 })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'string', example: '2' },
        basePrice: { type: 'string', example: '120' },
        preparationTime: { type: 'string', example: '20' },
        languages: {
          type: 'string',
          example: JSON.stringify([
            { languageCode: 'en', name: 'Updated Product', shortDescription: 'New short desc', longDescription: 'New long desc' },
            { languageCode: 'ar', name: 'المنتج المحدّث', shortDescription: 'وصف قصير جديد', longDescription: 'وصف طويل جديد' },
          ]),
        },
        existingImages: {
          type: 'string',
          description: 'JSON array of existing image IDs to keep',
          example: JSON.stringify([{ id: 1 }, { id: 2 }]),
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload up to 5 new images',
        },
      },
      required: ['languages'],
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Product updated successfully',
        productId: 101,
      },
    },
  })
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),
  )
  async updateProductWithImage(
    @Param('productId',ParseIntPipe) productId: number,
    @Body() body: UpdateProductWithImageDto,
    @I18n() i18n: I18nContext,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    let existingImages: ExistingImage[] = [];
    try {
      existingImages = parseAndValidateExistingImages(body.existingImages);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const images = files.images || [];
    const lang = getLang(i18n);
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
  @ApiOperation({ summary: 'Get all products of a store for customers' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiParam({ name: 'storeId', type: Number })
  @ApiResponse({status: 200,description: 'Paginated list of products with offers',type: PaginatedProductWithOfferDto})
  async getCustomerStoreProducts(
    @Param('storeId',ParseIntPipe) storeId: number,
    @I18n() i18n: I18nContext,
    @Query('name') name: string,
    @Query('categoryId',new ParseIntPipe({ optional: true })) categoryId?: number,
    @Query('page',new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit',new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    const lang = getLang(i18n);
    return this.productService.getCustomerStoreProducts(
      storeId,
      lang,
      page,
      limit,
      categoryId,
      name,
    );
  }

  @Serilaize(PaginatedSimpleProductDto)
  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Get('all')
  @ApiOperation({ summary: 'Get all products of the current store' })
  @ApiQuery({ name: 'storeId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiSecurity('access-token')
  @ApiResponse({ status: 200, description: 'Paginated list of products for the store', type: PaginatedSimpleProductDto})
  async getProductsByStore(
    @CurrentUser() store: Store,
    @Query('categoryId') categoryId: number,
    @Query('page',new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit',new ParseIntPipe({ optional: true })) limit = 10,
    @Query('name') name: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.productService.getProductsByStore(
      store.id,
      lang,
      page,
      limit,
      categoryId,
      name,
    );
  }

  @Serilaize(FullProductDetailsDto)
  @Get('/:productId')
  @ApiOperation({ summary: 'Get full details of a product' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiResponse({ status: 200, type: FullProductDetailsDto })
  getFullProductDetails(@Param('productId',ParseIntPipe) productId: string,@I18n() i18n: I18nContext,) {
    const lang = getLang(i18n);
    return this.productService.getFullProductDetails(+productId,lang);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(fullProductDetailsWihtPrivateDetails)
  @Get('/:productId/byStore')
  @ApiOperation({ summary: 'Get full product details for the store (including inactive)' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiParam({ name: 'productId', example: 101 })
  @ApiResponse({ status: 200, type: fullProductDetailsWihtPrivateDetails })
  getFullProductDetailsForStore(@Param('productId',ParseIntPipe) productId: string, @I18n() i18n: I18nContext,) {
    const lang = getLang(i18n);
    return this.productService.getFullProductDetails(+productId,lang,{ includeInactive: true,includeAllLanguages:true });
  }

  @Put('active/:productId')
  @UseGuards(StoreOrOwnerGuard)
  @ApiOperation({ summary: 'Toggle product active status' })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiParam({ name: 'productId', example: 101 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Product activity status changed successfully',
      },
    },
  })
  changeProductActivity(
    @Param('productId',ParseIntPipe) productId: number,
    @CurrentUser() store: Store,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    return this.productService.changeProductActivity(
      +productId,
      store.id,
      lang,
    );
  }

  @UseGuards(StoreOrOwnerGuard)
  @Serilaize(TopProductResponseDto)
  @Get('top-sales/:storeId')
  @ApiOperation({ summary: 'Get top 4 selling products for a store' })
  @ApiResponse({ status: 200, type: [TopProductResponseDto] })
  @ApiSecurity('access-token')
  async getTopSellingProducts(
    @CurrentUser() store:Store,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.productService.getTopProductsBySales(store.id, lang);
  }
}
