import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryProvider } from './providers/category.provider';
import { StoreModule } from '../store/store.module';
import { OwnerModule } from '../owner/owner.module';
import { ProductModule } from '../product/product.module';
import { CategoryLanguageProvider } from './providers/category_language.provider';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ...CategoryProvider,...CategoryLanguageProvider],
  imports: [StoreModule, OwnerModule, forwardRef(() => ProductModule),DatabaseModule],
  exports:[CategoryService]
})
export class CategoryModule {}
