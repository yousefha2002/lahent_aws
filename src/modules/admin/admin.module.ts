import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminProvider } from './providers/admin.provider';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, ...AdminProvider],
  exports: [AdminService],
  imports: [CloudinaryModule],
})
export class AdminModule {}
