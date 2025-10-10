import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryProvider } from './providers/category.provider';
import { ProductModule } from '../product/product.module';
import { CategoryLanguageProvider } from './providers/category_language.provider';
import { DatabaseModule } from 'src/database/database.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, ...CategoryProvider,...CategoryLanguageProvider],
  imports: [forwardRef(() => ProductModule),DatabaseModule,forwardRef(()=>UserContextModule)],
  exports:[CategoryService]
})
export class CategoryModule {}
