import {Body,Controller,Param,Post,Put,UploadedFile,UploadedFiles,UseFilters,UseGuards,UseInterceptors} from '@nestjs/common';
import { ProuductVariantService } from './prouduct_variant.service';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { CreateProductVariantsDto } from './dto/create-variant.dto';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { UpdateProductVariantDto } from './dto/update-variant.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('product-variant')
export class ProuductVariantController {
  constructor(
    private readonly prouductVariantService: ProuductVariantService,
  ) {}

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateProduct,ApprovedStoreGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Put(':variantId')
  @ApiOperation({ summary: 'Update a product variant with optional image' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'variantId', type: Number, description: 'ID of the variant', example: 5 })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        additionalPrice: { type: 'number', example: 10 },
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
  @ApiResponse({status: 200,schema: { example: { message: 'Variant updated successfully' } },})
  update(
    @Body() body: UpdateProductVariantDto,
    @Param('variantId') variantId: string,
    @CurrentUser() user: CurrentUserType,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const {context} = user
    return this.prouductVariantService.updateVarianteProduct(
      +variantId,
      context.id,
      body,
      file,
    ); 
  }

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateProduct,ApprovedStoreGuard)
  @Put('/active/:variantId')
  @ApiOperation({ summary: 'Toggle active status of a product variant' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'variantId', type: Number, description: 'ID of the variant', example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Active status updated successfully',
    schema: { example: { message: 'Variant active status updated' } },
  })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  active(@Param('variantId') variantId: string, @CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.prouductVariantService.updateIsActive(+variantId, context.id);
  }

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.CreateProduct,ApprovedStoreGuard)
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Post()
  @ApiOperation({ summary: 'Create multiple product variants with images' })
  @ApiSecurity('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiBody({type:CreateProductVariantsDto})
  @ApiResponse({
    status: 201,
    description: 'Variants have been created successfully',
    schema: { example: { message: 'Variants have been created successfully' } },
  })
  create(
    @Body() body:CreateProductVariantsDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user:CurrentUserType
  ) {
    const filesRecord: Record<string, Express.Multer.File> = {};
    files.forEach((file, index) => {
      filesRecord[`image_${index}`] = file;
    });
    const {context} = user
    return this.prouductVariantService.createMultipleVariants(body,filesRecord,context.id);
  }
  }