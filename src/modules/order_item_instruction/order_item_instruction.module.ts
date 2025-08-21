import { Module } from '@nestjs/common';
import { OrderItemInstructionService } from './order_item_instruction.service';
import { OrderItemInstructionController } from './order_item_instruction.controller';
import { OrderItemInstructionProvider } from './providers/order_item_instruction.provider';

@Module({
  controllers: [OrderItemInstructionController],
  providers: [OrderItemInstructionService,...OrderItemInstructionProvider],
  exports:[OrderItemInstructionService]
})
export class OrderItemInstructionModule {}
