import { forwardRef, Module } from '@nestjs/common';
import { GiftTemplateService } from './gift_template.service';
import { GiftTemplateController } from './gift_template.controller';
import { GiftTemplateProvider } from './providers/gift_template.provider';
import { GiftCategoryModule } from '../gift_category/gift_category.module';
import { UserContextModule } from '../user-context/user-context.module';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [GiftTemplateController],
  providers: [GiftTemplateService, ...GiftTemplateProvider],
  imports: [GiftCategoryModule, forwardRef(()=>UserContextModule), S3Module],
  exports: [GiftTemplateService],
})
export class GiftTemplateModule {}
