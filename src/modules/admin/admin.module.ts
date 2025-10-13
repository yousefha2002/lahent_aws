import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminProvider } from './providers/admin.provider';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ...AdminProvider],
  exports: [AdminService],
})
export class AdminModule {}
