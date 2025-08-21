import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProuductVariantService } from './prouduct_variant.service';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/multer/multer.options';
import { MulterExceptionFilter } from 'src/multer/multer.exception.filter';
import { CreateProductVariantDto } from './dto/create-variant.dto';

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
    @Body() body: CreateProductVariantDto,
    @Param('variantId') variantId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.prouductVariantService.updateVarianteProduct(
      +variantId,
      body,
      file,
    );
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:variantId')
  active(@Param('variantId') variantId: string) {
    return this.prouductVariantService.updateIsActive(+variantId, true);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/unactive/:variantId')
  unactive(@Param('variantId') variantId: string) {
    return this.prouductVariantService.updateIsActive(+variantId, false);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Delete('/:variantId')
  delete(@Param('variantId') variantId: string) {
    return this.prouductVariantService.deleteVariantProduct(+variantId);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @UseFilters(MulterExceptionFilter)
  @Post()
  create(
    @Body() body: CreateProductVariantDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('upload icon is required');
    }
    return this.prouductVariantService.createSingleVariant(body, file);
  }
}
