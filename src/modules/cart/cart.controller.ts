import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { CreateCartProductDto } from './dto/create-product-cart.dto';
import { UpdateCartProductQuantityDto } from './dto/update-productCart-quantity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CartItemWithOfferDto } from './dto/cart-item-with-offer.dto';
import { CartWithStoreDto } from './dto/cart-with-store.dto';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

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
  @UseGuards(CustomerGuard, CompletedProfileGuard)
  addProductForCart(
    @CurrentUser() customer: Customer,
    @Body() body: CreateCartProductDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.cartService.createProductCart(body, customer.id, lang);
  }

  @Put('update-product/:cartItemId')
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Update a product in the customer cart' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item', example: 10 })
  @ApiBody({ type: CreateCartProductDto })
  @ApiResponse({
    status: 200,
    description: 'Cart product updated successfully',
    schema: { example: { message: 'Cart product updated successfully' } },
  })
  updateProductForCart(
    @CurrentUser() customer: Customer,
    @Body() body: CreateCartProductDto,
    @Param('cartItemId') cartItemId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.cartService.updateProductCartItem(+cartItemId, body, customer.id, lang);
  }

  @Delete('remove-product/:cartItemId')
  @UseGuards(CustomerGuard)
  @ApiOperation({ summary: 'Remove a product from the customer cart' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'cartItemId', type: Number, description: 'ID of the cart item', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Cart product removed successfully',
    schema: { example: { message: 'Product removed from cart successfully' } },
  })
  removeProductForCart(
    @CurrentUser() customer: Customer,
    @Param('cartItemId') cartItemId: string,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.cartService.deleteProductFromCart(+cartItemId, customer.id, lang);
  }

  @Put('update-product-qty/:cartItemId')
  @UseGuards(CustomerGuard)
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
    @CurrentUser() customer: Customer,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartProductQuantityDto,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.cartService.updateProductQuantity(+cartItemId, customer.id, dto, lang);
  }

  @Serilaize(CartItemWithOfferDto)
  @UseGuards(CustomerGuard)
  @Get(':storeId')
  @ApiOperation({ summary: 'Get all cart items for a store with offers' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'storeId', type: Number, description: 'ID of the store', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'List of cart items with applied offers',
    type: [CartItemWithOfferDto],
  })
  getCartItemsWithOffers(
    @CurrentUser() user: Customer,
    @Param('storeId', ParseIntPipe) storeId: number,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.cartService.getCartItemsWithOffers(storeId, user.id, lang);
  }

  @Serilaize(CartWithStoreDto)
  @UseGuards(CustomerGuard)
  @Get('all/byCustomer')
  @ApiOperation({ summary: 'Get all carts for the current customer' })
  @ApiSecurity('access-token')
  @ApiResponse({
    status: 200,
    description: 'List of carts with their store details',
    type: [CartWithStoreDto],
  })
  findAllCartsByCustomer(
    @CurrentUser() user: Customer
  ) {
    return this.cartService.findAllCartsByCustomer(user.id);
  }
}