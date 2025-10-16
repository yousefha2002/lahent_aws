import { forwardRef, Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { AvatarProvider } from './providers/avatar.provider';
import { UserContextModule } from '../user-context/user-context.module';
import { S3Module } from '../s3/s3.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  controllers: [AvatarController],
  providers: [AvatarService,...AvatarProvider],
  exports:[AvatarService],
  imports:[forwardRef(()=>UserContextModule),S3Module,AuditLogModule]
})
export class AvatarModule {}
