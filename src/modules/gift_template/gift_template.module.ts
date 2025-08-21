import { Module } from '@nestjs/common';
import { GiftTemplateService } from './gift_template.service';
import { GiftTemplateController } from './gift_template.controller';
import { GiftTemplateProvider } from './providers/gift_template.provider';
import { GiftCategoryModule } from '../gift_category/gift_category.module';
import { AdminModule } from '../admin/admin.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [GiftTemplateController],
  providers: [GiftTemplateService, ...GiftTemplateProvider],
  imports: [GiftCategoryModule, AdminModule, CloudinaryModule],
  exports: [GiftTemplateService],
})
export class GiftTemplateModule {}
