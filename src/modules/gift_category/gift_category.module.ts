import { forwardRef, Module } from '@nestjs/common';
import { GiftCategoryService } from './gift_category.service';
import { GiftCategoryController } from './gift_category.controller';
import { GiftCategoryProvider } from './providers/gift_category.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [GiftCategoryController],
  providers: [GiftCategoryService,...GiftCategoryProvider],
  imports:[forwardRef(()=>UserContextModule)],
  exports:[GiftCategoryService]
})
export class GiftCategoryModule {}
