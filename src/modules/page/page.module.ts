import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { PageProvider } from './providers/page.provider';
import { PageLanguageProvider } from './providers/page_language.provider';
import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [PageController],
  providers: [PageService,...PageProvider,...PageLanguageProvider],
  imports:[AdminModule]
})
export class PageModule {}
