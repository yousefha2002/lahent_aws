import { Controller } from '@nestjs/common';
import { FcmTokenService } from './fcm_token.service';

@Controller('fcm_token')
export class FcmTokenController {
  constructor(private readonly fcmTokenService: FcmTokenService) {}
}
