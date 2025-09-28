import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ProductExtraService } from './product_extra.service';
import { UpdateProductExtraDto } from './dto/update-extra-product.dto';
import { ApprovedStoreGuard } from 'src/common/guards/approvedStore.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Store } from '../store/entities/store.entity';
import { CreateProductExtraDto } from './dto/create-product-extra.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { StoreGuard } from 'src/common/guards/store.guard';

@Controller('product-extra')
export class ProductExtraController {
  constructor(private readonly productExtraService: ProductExtraService) {}

  @UseGuards(StoreGuard, ApprovedStoreGuard)
  @Put(':extraId')
  @ApiOperation({ summary: 'Update a product extra' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'extraId', type: Number, description: 'ID of the product extra', example: 7 })
  @ApiBody({ type: UpdateProductExtraDto })
  @ApiResponse({
    status: 200,
    description: 'Product extra updated successfully',
    schema: {
      example: { message: 'Product extra updated successfully' },
    },
  })
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

  @UseGuards(StoreGuard, ApprovedStoreGuard)
  @Put('/active/:extraId')
  @ApiOperation({ summary: 'Toggle active status for a product extra' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'extraId', type: Number, description: 'ID of the product extra', example: 12 })
  @ApiResponse({
    status: 200,
    description: 'Active status updated successfully',
    schema: {
      example: { message: 'active status updated' },
    },
  })
  active(@Param('extraId') extraId: string, @CurrentUser() store: Store) {
    return this.productExtraService.updateIsActive(+extraId, store.id);
  }

  @UseGuards(StoreGuard, ApprovedStoreGuard)
  @Post()
  @ApiOperation({ summary: 'Create or update product extras' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateProductExtraDto })
  @ApiResponse({
    status: 201,
    description: 'Product extras created/updated successfully',
    schema: {
      example: {
        message: 'Product extra updated successfully',
      },
    },
  })
  createProductExtras(@Body() body: CreateProductExtraDto,@CurrentUser() store:Store) {
    return this.productExtraService.createProductExtras(body,store.id);
  }
}
