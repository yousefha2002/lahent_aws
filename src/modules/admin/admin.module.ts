import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminProvider } from './providers/admin.provider';
import { RoleModule } from '../role/role.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ...AdminProvider],
  exports: [AdminService],
  imports:[RoleModule]
})
export class AdminModule {}
