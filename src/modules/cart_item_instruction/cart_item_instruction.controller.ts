import { Controller } from '@nestjs/common';
import { CartItemInstructionService } from './cart_item_instruction.service';

@Controller('cart-item-instruction')
export class CartItemInstructionController {
  constructor(private readonly cartItemInstructionService: CartItemInstructionService) {}
}
