import { Module } from '@nestjs/common';
import { UserPointHistoryService } from './user_point_history.service';
import { UserPointHistoryController } from './user_point_history.controller';
import { UserPointsHistoryProvider } from './providers/user_point_history.provider';

@Module({
  controllers: [UserPointHistoryController],
  providers: [UserPointHistoryService,...UserPointsHistoryProvider],
  exports:[UserPointHistoryService]
})
export class UserPointHistoryModule {}
