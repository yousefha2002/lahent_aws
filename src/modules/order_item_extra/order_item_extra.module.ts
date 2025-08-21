import { Module } from '@nestjs/common';
import { OrderItemExtraService } from './order_item_extra.service';
import { OrderItemExtraController } from './order_item_extra.controller';
import { OrderItemExtraProvider } from './providers/order_item_extra.provider';

@Module({
  controllers: [OrderItemExtraController],
  providers: [OrderItemExtraService,...OrderItemExtraProvider],
  exports:[OrderItemExtraService]
})
export class OrderItemExtraModule {}
