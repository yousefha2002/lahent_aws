import { Controller } from '@nestjs/common';
import { UserContextService } from './user-context.service';

@Controller('user-context')
export class UserContextController {
  constructor(private readonly userContextService: UserContextService) {}
}
