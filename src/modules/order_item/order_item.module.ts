import { OrderItemProvider } from './providers/order_item.provider';
import { Module } from '@nestjs/common';
import { OrderItemService } from './order_item.service';
import { OrderItemController } from './order_item.controller';

@Module({
  controllers: [OrderItemController],
  providers: [OrderItemService,...OrderItemProvider],
  exports:[OrderItemService]
})
export class OrderItemModule {}
