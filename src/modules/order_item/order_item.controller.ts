import { Controller } from '@nestjs/common';
import { OrderItemService } from './order_item.service';

@Controller('order-item')
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}
}
