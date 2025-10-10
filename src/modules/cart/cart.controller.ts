import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { CreateCartProductDto } from './dto/create-product-cart.dto';
import { UpdateCartProductQuantityDto } from './dto/update-productCart-quantity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CartWithTotalsDto } from './dto/cart-item-with-offer.dto';
import { CartWithStoreDto } from './dto/cart-with-store.dto';
import { CompletedProfileGuard } from 'src/common/guards/auths/completed-profile.guard';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';
import { UpdateCartProductDto } from './dto/update-product-cart.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { PermissionGuard } from 'src/common/decorators/permession-guard.decorator';
import { RoleStatus } from 'src/common/enums/role_status';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-product')
  @ApiOperation({ summary: 'Add product to customer cart' })
  @ApiSecurity('access-token')
  @ApiBody({ type: CreateCartProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product successfully added to cart',
    schema: { example: { message: 'Product added to cart successfully' } },
  })
  @PermissionGuard([RoleStatus.CUSTOMER],CompletedProfileGuard)
  addProductForCart(
    @CurrentUser() user: CurrentUserType,
    @Body() body: CreateCartProductDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.cartService.createProductCart(body, context.id, lang);
  }

  @Put('update-product/:cartItemId')
  @PermissionGuard([RoleStatus.CUSTOMER])
  @ApiOperation({ summary: 'Update a product in the customer cart' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item', example: 10 })
  @ApiBody({ type: UpdateCartProductDto })
  @ApiResponse({
    status: 200,
    description: 'Cart product updated successfully',
    schema: { example: { message: 'Cart product updated successfully' } },
  })
  updateProductForCart(
    @CurrentUser() user: CurrentUserType,
    @Body() body: UpdateCartProductDto,
    @Param('cartItemId') cartItemId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.cartService.updateProductCartItem(+cartItemId, body, context.id, lang);
  }

  @Delete('remove-product/:cartItemId')
  @PermissionGuard([RoleStatus.CUSTOMER])
  @ApiOperation({ summary: 'Remove a product from the customer cart' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Cart product removed successfully',
    schema: { example: { message: 'Product removed from cart successfully' } },
  })
  removeProductForCart(
    @CurrentUser() user: CurrentUserType,
    @Param('cartItemId') cartItemId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.cartService.deleteProductFromCart(+cartItemId, context.id, lang);
  }

  @Put('update-product-qty/:cartItemId')
  @PermissionGuard([RoleStatus.CUSTOMER])
  @ApiOperation({ summary: 'Update quantity of a product in the customer cart' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item', example: 10 })
  @ApiBody({ type: UpdateCartProductQuantityDto })
  @ApiResponse({
    status: 200,
    description: 'Cart product quantity updated successfully',
    schema: { example: { message: 'Product quantity updated successfully' } },
  })
  updateProductCartQty(
    @CurrentUser() user: CurrentUserType,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartProductQuantityDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.cartService.updateProductQuantity(+cartItemId, context.id, dto, lang);
  }

  @Serilaize(CartWithTotalsDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Get(':storeId')
  @ApiOperation({ summary: 'Get all cart items for a store with offers' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', type: Number, description: 'ID of the store', example: 1 })
  @ApiQuery({ name: 'couponCode', required: false, description: 'Optional coupon code' })
  @ApiResponse({
    status: 200,
    description: 'List of cart items with applied offers',
    type: [CartWithTotalsDto],
  })
  getCartItemsWithOffers(
    @CurrentUser() user: CurrentUserType,
    @Param('storeId', ParseIntPipe) storeId: number,
    @I18n() i18n: I18nContext,
    @Query('couponCode') couponCode: string
  ) {
    const lang = getLang(i18n);
    const {context} = user
    return this.cartService.getCartItemsWithOffers(storeId, context.id, lang,couponCode);
  }

  @Serilaize(CartWithStoreDto)
  @PermissionGuard([RoleStatus.CUSTOMER])
  @Get('all/byCustomer')
  @ApiOperation({ summary: 'Get all carts for the current customer' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'List of carts with their store details',
    type: [CartWithStoreDto],
  })
  findAllCartsByCustomer(
    @CurrentUser() user: CurrentUserType
  ) {
    const {context} = user
    return this.cartService.findAllCartsByCustomer(context.id);
  }
}