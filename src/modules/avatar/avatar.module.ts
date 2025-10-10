import { forwardRef, Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { AvatarProvider } from './providers/avatar.provider';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserContextModule } from '../user-context/user-context.module';

@Module({
  controllers: [AvatarController],
  providers: [AvatarService,...AvatarProvider],
  exports:[AvatarService],
  imports:[forwardRef(()=>UserContextModule),CloudinaryModule]
})
export class AvatarModule {}
