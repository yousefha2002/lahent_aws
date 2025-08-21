import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CartItemWithProductOptionsDto } from './dto/cart_item.dto';
import { Language } from 'src/common/enums/language';

@Controller('cart-item')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Serilaize(CartItemWithProductOptionsDto)
  @UseGuards(CustomerGuard)
  @Get(':id')
  getCartItemWithProductOptions(@Param('id') cartItemId:number,@CurrentUser() user:Customer,@Query('lang') lang=Language.en)
  {
    return this.cartItemService.getCartItemWithProductOptions(cartItemId,user.id,lang)
  }
}
