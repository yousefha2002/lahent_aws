import { Controller } from '@nestjs/common';
import { OrderItemInstructionService } from './order_item_instruction.service';

@Controller('order-item-instruction')
export class OrderItemInstructionController {
  constructor(private readonly orderItemInstructionService: OrderItemInstructionService) {}
}
