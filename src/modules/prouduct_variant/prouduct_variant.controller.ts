import {
  BadRequestException,
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

@Controller('product-variant')
export class ProuductVariantController {
  constructor(
    private readonly prouductVariantService: ProuductVariantService,
  ) {}

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Put(':variantId')
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
  active(@Param('variantId') variantId: string, @CurrentUser() store: Store) {
    return this.prouductVariantService.updateIsActive(+variantId, store.id);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Post()
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