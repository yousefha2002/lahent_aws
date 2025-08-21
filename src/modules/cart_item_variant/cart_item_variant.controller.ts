import { Controller } from '@nestjs/common';
import { CartItemVariantService } from './cart_item_variant.service';

@Controller('cart-item-variant')
export class CartItemVariantController {
  constructor(private readonly cartItemVariantService: CartItemVariantService) {}
}
