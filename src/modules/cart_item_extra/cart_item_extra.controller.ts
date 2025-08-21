import { Controller } from '@nestjs/common';
import { CartItemExtraService } from './cart_item_extra.service';

@Controller('cart-item-extra')
export class CartItemExtraController {
  constructor(private readonly cartItemExtraService: CartItemExtraService) {}
}
