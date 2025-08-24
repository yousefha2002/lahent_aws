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
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateProductExtraDto } from './dto/create-product-extra.dto';

@Controller('product-extra')
export class ProductExtraController {
  constructor(private readonly productExtraService: ProductExtraService) {}

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put(':extraId')
  update(
    @Body() body: UpdateProductExtraDto,
    @Param('extraId') extraId: string,
    @CurrentUser() store: Store,
  ) {
    return this.productExtraService.updateExtraProduct(
      +extraId,
      body,
      store.id,
    );
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Put('/active/:extraId')
  active(@Param('extraId') extraId: string, @CurrentUser() store: Store) {
    return this.productExtraService.updateIsActive(+extraId, store.id);
  }

  @UseGuards(StoreOrOwnerGuard, ApprovedStoreGuard)
  @Post()
  createProductExtras(@Body() body: CreateProductExtraDto,@CurrentUser() store:Store) {
    return this.productExtraService.createProductExtras(body,store.id);
  }
}
