import { Module } from '@nestjs/common';
import { GiftCategoryService } from './gift_category.service';
import { GiftCategoryController } from './gift_category.controller';
import { GiftCategoryProvider } from './providers/gift_category.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [GiftCategoryController],
  providers: [GiftCategoryService,...GiftCategoryProvider],
  imports:[AdminModule],
  exports:[GiftCategoryService]
})
export class GiftCategoryModule {}
