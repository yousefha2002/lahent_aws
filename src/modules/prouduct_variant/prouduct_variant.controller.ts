import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProuductVariantService } from './prouduct_variant.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { CreateProductVariantsDto } from './dto/create-variant.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { UpdateProductVariantDto } from './dto/update-variant.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('product-variant')
export class ProuductVariantController {
  constructor(
    private readonly prouductVariantService: ProuductVariantService,
  ) {}

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Put(':variantId')
  @ApiOperation({ summary: 'Update a product variant with optional image' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'variantId', type: Number, description: 'ID of the variant', example: 5 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        additional_price: { type: 'number', example: 10 },
        languages: {
          type: 'string',
          description: 'JSON string of variant languages',
          example: JSON.stringify([
            { languageCode: 'en', name: 'Small' },
            { languageCode: 'ar', name: 'صغير' },
          ]),
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Upload a new image for the variant (optional)',
        },
      },
      required: ['additional_price'],
    },
  })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Variant updated successfully',
    schema: { example: { message: 'Variant updated successfully' } },
  })
  update(
    @Body() body: UpdateProductVariantDto,
    @Param('variantId') variantId: string,
    @CurrentUser() store: Store,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.prouductVariantService.updateVarianteProduct(
      +variantId,
      store.id,
      body,
      file,
    ); 
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:variantId')
  @ApiOperation({ summary: 'Toggle active status of a product variant' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'variantId', type: Number, description: 'ID of the variant', example: 5 })
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Active status updated successfully',
    schema: { example: { message: 'Variant active status updated' } },
  })
  active(@Param('variantId') variantId: string, @CurrentUser() store: Store) {
    return this.prouductVariantService.updateIsActive(+variantId, store.id);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Post()
  @ApiOperation({ summary: 'Create multiple product variants with images' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'storeId', required: false, example: '1' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: '1' },
        variants: {
          type: 'string',
          example: JSON.stringify([
            {
              additional_price: 10,
              categoryId: 2,
              languages: [
                { languageCode: 'en', name: 'Small' },
                { languageCode: 'ar', name: 'صغير' },
              ],
            },
          ]),
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload images for each variant',
        },
      },
      required: ['productId', 'variants', 'images'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Variants have been created successfully',
    schema: { example: { message: 'Variants have been created successfully' } },
  })
  create(
    @Body() body:CreateProductVariantsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() store:Store
  ) {
    const filesRecord: Record<string, Express.Multer.File> = {};
    files.forEach((file, index) => {
      filesRecord[`image_${index}`] = file;
    });
    return this.prouductVariantService.createMultipleVariants(body,filesRecord,store.id);
    }
  }