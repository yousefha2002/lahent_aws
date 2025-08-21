import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { AvatarProvider } from './providers/avatar.provider';
import { AdminModule } from '../admin/admin.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [AvatarController],
  providers: [AvatarService,...AvatarProvider],
  exports:[AvatarService],
  imports:[AdminModule,CloudinaryModule]
})
export class AvatarModule {}
