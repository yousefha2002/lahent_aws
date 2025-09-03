import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { OwnerProvider } from './providers/owner.provider';
import { UserTokenModule } from '../user_token/user_token.module';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, ...OwnerProvider],
  exports: [OwnerService],
  imports:[UserTokenModule]
})
export class OwnerModule {}
