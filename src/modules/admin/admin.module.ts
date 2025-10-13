import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminProvider } from './providers/admin.provider';
import { RoleModule } from '../role/role.module';
import { UserTokenModule } from '../user_token/user_token.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ...AdminProvider],
  exports: [AdminService],
  imports:[RoleModule,UserTokenModule]
})
export class AdminModule {}
