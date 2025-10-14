import {Body,Controller,Param,Post,Put} from '@nestjs/common';
import { ProductExtraService } from './product_extra.service';
import { UpdateProductExtraDto } from './dto/update-extra-product.dto';
import { ApprovedStoreGuard } from 'src/common/guards/auths/approved-store.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateProductExtraDto } from './dto/create-product-extra.dto';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';
import { PermissionKey } from 'src/common/enums/permission-key';

@Controller('product-extra')
export class ProductExtraController {
  constructor(private readonly productExtraService: ProductExtraService) {}

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateProduct,ApprovedStoreGuard)
  @Put(':extraId')
  @ApiOperation({ summary: 'Update a product extra' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'extraId', type: Number, description: 'ID of the product extra', example: 7 })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
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
    @CurrentUser() user: CurrentUserType,
  ) {
    const {context} = user
    return this.productExtraService.updateExtraProduct(
      +extraId,
      body,
      context.id,
    );
  }

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.UpdateProduct,ApprovedStoreGuard)
  @Put('/active/:extraId')
  @ApiOperation({ summary: 'Toggle active status for a product extra' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'extraId', type: Number, description: 'ID of the product extra', example: 12 })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Active status updated successfully',
    schema: {
      example: { message: 'active status updated' },
    },
  })
  active(@Param('extraId') extraId: string, @CurrentUser() user: CurrentUserType) {
    const {context} = user
    return this.productExtraService.updateIsActive(+extraId, context.id);
  }

  @PermissionGuard([RoleStatus.STORE,RoleStatus.ADMIN],PermissionKey.CreateProduct,ApprovedStoreGuard)
  @Post()
  @ApiOperation({ summary: 'Create or update product extras' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateProductExtraDto })
  @ApiQuery({ name: 'storeId', required: false, example: 1 })
  @ApiResponse({
    status: 201,
    description: 'Product extras created/updated successfully',
    schema: {
      example: {
        message: 'Product extra updated successfully',
      },
    },
  })
  createProductExtras(@Body() body: CreateProductExtraDto,@CurrentUser() user:CurrentUserType) {
    const {context} = user
    return this.productExtraService.createProductExtras(body,context.id);
  }
}
