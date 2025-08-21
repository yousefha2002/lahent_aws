import { Controller } from '@nestjs/common';
import { OrderItemExtraService } from './order_item_extra.service';

@Controller('order-item-extra')
export class OrderItemExtraController {
  constructor(private readonly orderItemExtraService: OrderItemExtraService) {}
}
