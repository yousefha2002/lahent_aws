import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { CustomerGuard } from 'src/common/guards/roles/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CartItemWithProductOptionsDto } from './dto/cart_item.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { getLang } from 'src/common/utils/get-lang.util';

@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Serilaize(CartItemWithProductOptionsDto)
  @UseGuards(CustomerGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get cart item with selected product options' })
  @ApiSecurity('access-token')
  @ApiParam({ name: 'id', type: Number, description: 'Cart item ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Cart item with extras, variants, instructions, and offer details',
    type: CartItemWithProductOptionsDto,
  })
  getCartItemWithProductOptions(
    @Param('id') cartItemId: number,
    @CurrentUser() user: Customer,
    @I18n() i18n: I18nContext
  ) {
    const lang = getLang(i18n);
    return this.cartItemService.getCartItemWithProductOptions(cartItemId, user.id, lang);
  }
}
