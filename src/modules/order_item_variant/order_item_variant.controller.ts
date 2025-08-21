import { Controller } from '@nestjs/common';
import { OrderItemVariantService } from './order_item_variant.service';

@Controller('order-item-variant')
export class OrderItemVariantController {
  constructor(private readonly orderItemVariantService: OrderItemVariantService) {}
}
