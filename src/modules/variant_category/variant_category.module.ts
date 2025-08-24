import { Module } from '@nestjs/common';
import { VariantCategoryService } from './variant_category.service';
import { VariantCategoryController } from './variant_category.controller';
import { VariantCategoryProvider } from './providers/variant_category.provider';
import { AdminModule } from '../admin/admin.module';
import { VariantCategoryLanguageProvider } from './providers/variant_category_language.provider';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [VariantCategoryController],
  providers: [VariantCategoryService,...VariantCategoryProvider,...VariantCategoryLanguageProvider],
  imports:[AdminModule,DatabaseModule],
  exports:[VariantCategoryService]
})
export class VariantCategoryModule {}
