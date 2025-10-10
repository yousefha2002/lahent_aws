import { forwardRef, Module } from '@nestjs/common';
import { ProductInstructionService } from './product_instruction.service';
import { ProductInstructionController } from './product_instruction.controller';
import { ProductInstructionProvider } from './providers/product_instruction.provider';
import { ProductModule } from '../product/product.module';
import { ProductInstructionLanguageProvider } from './providers/product_instruction_language.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [ProductInstructionController],
  providers: [ProductInstructionService, ...ProductInstructionProvider,...ProductInstructionLanguageProvider],
  exports: [ProductInstructionService],
  imports: [forwardRef(() => ProductModule),DatabaseModule,forwardRef(()=>UserContextModule)],
})
export class ProductInstructionModule {}
