import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { PageProvider } from './providers/page.provider';
import { PageLanguageProvider } from './providers/page_language.provider';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [PageController],
  providers: [PageService,...PageProvider,...PageLanguageProvider],
  imports:[UserContextModule]
})
export class PageModule {}
