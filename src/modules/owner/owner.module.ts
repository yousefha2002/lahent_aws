import { forwardRef, Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { OwnerProvider } from './providers/owner.provider';
import { UserTokenModule } from '../user_token/user_token.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, ...OwnerProvider],
  exports: [OwnerService],
  imports:[UserTokenModule,forwardRef(()=>UserContextModule)]
})
export class OwnerModule {}
