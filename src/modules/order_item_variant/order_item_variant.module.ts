import { Module } from '@nestjs/common';
import { OrderItemVariantService } from './order_item_variant.service';
import { OrderItemVariantController } from './order_item_variant.controller';
import { OrderItemVariantProvider } from './providers/order_item_variant.provider';

@Module({
  controllers: [OrderItemVariantController],
  providers: [OrderItemVariantService,...OrderItemVariantProvider],
  exports:[OrderItemVariantService]
})
export class OrderItemVariantModule {}
