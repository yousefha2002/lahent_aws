import { Module } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { DeletionController } from './deletion.controller';
import { CustomerModule } from 'src/modules/customer/customer.module';
import { DatabaseModule } from 'src/database/database.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { UserTokenModule } from 'src/modules/user_token/user_token.module';

@Module({
  controllers: [DeletionController],
  providers: [DeletionService],
  imports:[CustomerModule,DatabaseModule,AdminModule,UserTokenModule]
})
export class DeletionModule {}
