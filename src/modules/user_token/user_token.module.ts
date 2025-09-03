import { Module } from '@nestjs/common';
import { UserTokenService } from './user_token.service';
import { UserTokenController } from './user_token.controller';
import { UserTokenProvider } from './providers/user_token.provider';

@Module({
  controllers: [UserTokenController],
  providers: [UserTokenService,...UserTokenProvider],
  exports:[UserTokenService]
})
export class UserTokenModule {}
