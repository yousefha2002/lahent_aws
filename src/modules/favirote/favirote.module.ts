import { Module } from '@nestjs/common';
import { FaviroteService } from './favirote.service';
import { FaviroteController } from './favirote.controller';
import { FavoriteProvider } from './providers/favorite.provider';
import { StoreModule } from '../store/store.module';
import { CustomerModule } from '../customer/customer.module';

@Module({
  controllers: [FaviroteController],
  providers: [FaviroteService, ...FavoriteProvider],
  imports: [StoreModule, CustomerModule],
})
export class FaviroteModule {}
