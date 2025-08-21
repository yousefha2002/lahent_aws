import { forwardRef, Module } from '@nestjs/common';
import { ProductInstructionService } from './product_instruction.service';
import { ProductInstructionController } from './product_instruction.controller';
import { ProductInstructionProvider } from './providers/product_instruction.provider';
import { ProductModule } from '../product/product.module';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';

@Module({
  controllers: [ProductInstructionController],
  providers: [ProductInstructionService, ...ProductInstructionProvider],
  exports: [ProductInstructionService],
  imports: [StoreModule, OwnerModule, forwardRef(() => ProductModule)],
})
export class ProductInstructionModule {}
