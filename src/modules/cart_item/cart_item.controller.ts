import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { CartItemService } from './cart_item.service';
import { CustomerGuard } from 'src/common/guards/customer.guard';
import { CurrentUser } from 'src/common/decorators/currentUser.decorator';
import { Customer } from '../customer/entities/customer.entity';
import { Serilaize } from 'src/common/interceptors/serialize.interceptor';
import { CartItemWithProductOptionsDto } from './dto/cart_item.dto';
import { Language } from 'src/common/enums/language';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

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
  getCartItemWithProductOptions(@Param('id') cartItemId:number,@CurrentUser() user:Customer,@Req() req)
  {
    return this.cartItemService.getCartItemWithProductOptions(cartItemId,user.id,req.lang)
  }
}