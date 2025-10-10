import { forwardRef, Module } from '@nestjs/common';
import { FaviroteService } from './favirote.service';
import { FaviroteController } from './favirote.controller';
import { FavoriteProvider } from './providers/favorite.provider';
import { StoreModule } from '../store/store.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [FaviroteController],
  providers: [FaviroteService, ...FavoriteProvider],
  imports: [forwardRef(()=>StoreModule), forwardRef(()=>UserContextModule)],
  exports:[FaviroteService]
})
export class FaviroteModule {}
