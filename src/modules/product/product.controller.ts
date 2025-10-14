import {BadRequestException,Body,Controller,Get,Param,ParseIntPipe,Post,Put,Query,UploadedFiles,UseInterceptors} from '@nestjs/common';
import {AnyFilesInterceptor,FileFieldsInterceptor} from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateProductDto } from './dto/requests/create-product.dto';
import { multerOptions } from 'src/multer/multer.options';
import { UpdateProductWithImageDto } from './dto/requests/update-product-withImage.dto';
import {ExistingImage,validateExistingImages} from 'src/common/validators/existing-images.validator';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { PaginatedProductsCustomerViewDto } from './dto/responses/customer-product-view.dto';
import { PaginatedProductsStoreViewDto } from './dto/responses/store-product-view.dto';
import { FullProductDetailsDto, ProductFullDetailsForStoreDto } from './dto/responses/full-product-details.dto';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { TopProductResponseDto } from './dto/responses/top-product-response.dto';
import { StoreFinancialsFilterDto } from '../store/dto/requests/store-financials-filter.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new product with images and languages' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({status: 201,schema: {example: {message: 'Product created successfully',productId: 123}}})
  @ApiConsumes('multipart/form-data')
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.CreateProduct,ApprovedStoreGuard)
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async create(
    @CurrentUser() user: CurrentUserType,
    @Body() body: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @I18n() i18n: I18nContext,
  ) {
    const {context} = user
    if (!files || files.length === 0) {
      throw new BadRequestException('يجب إرسال صورة واحدة على الأقل للمنتج');
    }
    if (files.length > 5) {
      throw new BadRequestException('يمكن رفع 5 صور فقط للمنتج');
    }
    const lang = getLang(i18n);
    return this.productService.createProduct(context.id, body, files, lang);
  }

  @Put('update/:productId')
  @ApiOperation({ summary: 'Update product details with images and languages' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'productId', example: 101 })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiBody({ type: UpdateProductWithImageDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Product updated successfully',
        productId: 101,
      },
    },
  })
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateProduct,ApprovedStoreGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], multerOptions),)
  async updateProductWithImage(
    @Param('productId',ParseIntPipe) productId: number,
    @Body() body: UpdateProductWithImageDto,
    @I18n() i18n: I18nContext,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    let existingImages: ExistingImage[] = [];
    try {
      existingImages = validateExistingImages(body.existingImages);
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

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.ViewProduct)
  @Serilaize(TopProductResponseDto)
  @Get('top-sales/byStore')
  @ApiOperation({ summary: 'Get top 4 selling products for a store' })
  @ApiResponse({ status: 200, type: [TopProductResponseDto] })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiSecurity('access-token')
  async getTopSellingProducts(
    @CurrentUser() user:CurrentUserType,
    @I18n() i18n: I18nContext,
    @Query() query: StoreFinancialsFilterDto
  ) {
    const lang = getLang(i18n);
    const { filter, specificDate } = query;
    const {context} = user
    return this.productService.getTopProductsBySales(context.id, lang,filter,specificDate);
  }

  @Serilaize(PaginatedProductsCustomerViewDto)
  @Get('all/:storeId')
  @ApiOperation({ summary: 'Get all products of a store for customers' })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiParam({ name: 'storeId', type: Number })
  @ApiResponse({status: 200,description: 'Paginated list of products with offers',type: PaginatedProductsCustomerViewDto})
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

  @Serilaize(PaginatedProductsStoreViewDto)
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.ViewProduct)
  @Get('all')
  @ApiOperation({ summary: 'Get all products of the current store' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiSecurity('access-token')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Paginated list of products for the store', type: PaginatedProductsStoreViewDto})
  async getStoreProducts(
    @CurrentUser() user: CurrentUserType,
    @Query('categoryId') categoryId: number,
    @Query('page',new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit',new ParseIntPipe({ optional: true })) limit = 10,
    @Query('name') name: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.productService.getProductsByStore(
      context.id,
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
  getFullProductDetailsForCustomer(@Param('productId',ParseIntPipe) productId: string,@I18n() i18n: I18nContext,) {
    const lang = getLang(i18n);
    return this.productService.getFullProductDetails(+productId,lang);
  }

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.ViewProduct)
  @Serilaize(ProductFullDetailsForStoreDto)
  @Get('/:productId/byStore')
  @ApiOperation({ summary: 'Get full product details for the store (including inactive)' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'productId', example: 101 })
  @ApiResponse({ status: 200, type: ProductFullDetailsForStoreDto })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  getFullProductDetailsForStore(@Param('productId',ParseIntPipe) productId: string, @I18n() i18n: I18nContext,) {
    const lang = getLang(i18n);
    return this.productService.getFullProductDetails(+productId,lang,{ includeInactive: true,includeAllLanguages:true });
  }

  @Put('active/:productId')
  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateProduct,ApprovedStoreGuard)
  @ApiOperation({ summary: 'Toggle product active status' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'productId', example: 101 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Product activity status changed successfully',
      },
    },
  })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  changeProductActivity(
    @Param('productId',ParseIntPipe) productId: number,
    @CurrentUser() user: CurrentUserType,
    @I18n() i18n: I18nContext,
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.productService.changeProductActivity(
      +productId,
      context.id,
      lang,
    );
  }
}