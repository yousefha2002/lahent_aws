import { Module } from '@nestjs/common';
import { CartItemInstructionService } from './cart_item_instruction.service';
import { CartItemInstructionController } from './cart_item_instruction.controller';
import { CartItemInstructionProvider } from './providers/cart_item_instruction.provider';
import { ProductInstructionModule } from '../product_instruction/product_instruction.module';

@Module({
  controllers: [CartItemInstructionController],
  providers: [CartItemInstructionService, ...CartItemInstructionProvider],
  imports: [ProductInstructionModule],
  exports: [CartItemInstructionService],
})
export class CartItemInstructionModule {}
