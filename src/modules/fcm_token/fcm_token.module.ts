import { Module } from '@nestjs/common';
import { FcmTokenProvider } from './providers/fcm_token.provider';
import { FcmTokenController } from './fcm_token.controller';
import { FcmTokenService } from './fcm_token.service';

@Module({
  controllers: [FcmTokenController],
  providers: [FcmTokenService,...FcmTokenProvider,],
  exports:[FcmTokenService]
})
export class FcmTokenModule {}
