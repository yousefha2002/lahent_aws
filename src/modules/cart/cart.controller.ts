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
import { Language } from 'src/common/enums/language';
import { CompletedProfileGuard } from 'src/common/guards/completed-profile.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-product')
  @UseGuards(CustomerGuard,CompletedProfileGuard)
  addProductForCart(
    @CurrentUser() customer: Customer,
    @Body() body: CreateCartProductDto,
    @Query('lang') lang: Language = Language.en
  ) {
    return this.cartService.createProductCart(body, customer.id,lang);
  }

  @Put('update-product/:cartItemId')
  @UseGuards(CustomerGuard)
  updateProductForCart(
    @CurrentUser() customer: Customer,
    @Body() body: CreateCartProductDto,
    @Param('cartItemId') cartItemId: string,
    @Query('lang') lang: Language = Language.en
  ) {
    return this.cartService.updateProductCartItem(
      +cartItemId,
      body,
      customer.id,
      lang
    );
  }

  @Delete('remove-product/:cartItemId')
  @UseGuards(CustomerGuard)
  removeProductForCart(
    @CurrentUser() customer: Customer,
    @Param('cartItemId') cartItemId: string,
    @Query('lang') lang: Language = Language.en
  ) {
    return this.cartService.deleteProductFromCart(+cartItemId, customer.id,lang);
  }

  @Put('update-product-qty/:cartItemId')
  @UseGuards(CustomerGuard)
  updateProductCartQty(
    @CurrentUser() customer: Customer,
    @Param('cartItemId') cartItemId: string,
    @Body() dto: UpdateCartProductQuantityDto,
    @Query('lang') lang: Language = Language.en
  ) {
    return this.cartService.updateProductQuantity(
      +cartItemId,
      customer.id,
      dto,
      lang
    );
  }

  @Serilaize(CartItemWithOfferDto)
  @UseGuards(CustomerGuard)
  @Get(':cartId')
  getCartItemsWithOffers(
    @CurrentUser() user: Customer,
    @Param('cartId', ParseIntPipe) cartId: number,
  ) {
    return this.cartService.getCartItemsWithOffers(cartId, user.id);
  }

  @Serilaize(CartWithStoreDto)
  @UseGuards(CustomerGuard)
  @Get('all/byCustomer')
  findAllCartsByCustomer(@CurrentUser() user: Customer) {
    return this.cartService.findAllCartsByCustomer(user.id);
  }
}
