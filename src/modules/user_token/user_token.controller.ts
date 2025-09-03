import { Controller } from '@nestjs/common';
import { UserTokenService } from './user_token.service';

@Controller('user-token')
export class UserTokenController {
  constructor(private readonly userTokenService: UserTokenService) {}
}
