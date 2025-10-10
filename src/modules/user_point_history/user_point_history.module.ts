import { Module } from '@nestjs/common';
import { UserPointHistoryService } from './user_point_history.service';
import { UserPointHistoryController } from './user_point_history.controller';
import { UserPointsHistoryProvider } from './providers/user_point_history.provider';
import { CustomerModule } from '../customer/customer.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [UserPointHistoryController],
  providers: [UserPointHistoryService,...UserPointsHistoryProvider],
  exports:[UserPointHistoryService],
  imports:[UserContextModule]
})
export class UserPointHistoryModule {}
