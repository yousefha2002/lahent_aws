import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryProvider } from './providers/category.provider';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { ProductModule } from '../product/product.module';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ...CategoryProvider],
  imports: [StoreModule, OwnerModule, forwardRef(() => ProductModule)],
  exports:[CategoryService]
})
export class CategoryModule {}
