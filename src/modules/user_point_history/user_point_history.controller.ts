import { Controller } from '@nestjs/common';
import { UserPointHistoryService } from './user_point_history.service';

@Controller('user-point-history')
export class UserPointHistoryController {
  constructor(private readonly userPointHistoryService: UserPointHistoryService) {}
}
