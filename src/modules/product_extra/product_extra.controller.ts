import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductExtraService } from './product_extra.service';
import { UpdateProductExtraDto } from './dto/update-extra-product.dto';
import { StoreOrOwnerGuard } from 'src/common/guards/StoreOrOwner.guard';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { ExtraDto } from './dto/extra-dto';

@Controller('product-extra')
export class ProductExtraController {
  constructor(private readonly productExtraService: ProductExtraService) {}

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put(':extraId')
  update(
    @Body() body: UpdateProductExtraDto,
    @Param('extraId') extraId: string,
  ) {
    return this.productExtraService.updateExtraProduct(+extraId, body);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:extraId')
  active(@Param('extraId') extraId: string) {
    return this.productExtraService.updateIsActive(+extraId, true);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/unactive/:extraId')
  unactive(@Param('extraId') extraId: string) {
    return this.productExtraService.updateIsActive(+extraId, false);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Delete('/:extraId')
  delete(@Param('extraId') extraId: string) {
    return this.productExtraService.deleteExtraProduct(+extraId);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Serilaize(ExtraDto)
  @Post('')
  createSingle(@Body() body: UpdateProductExtraDto) {
    return this.productExtraService.createSingleExtraItem(body);
  }
}
