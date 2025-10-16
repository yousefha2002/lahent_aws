import { forwardRef, Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { TypeProvider } from './providers/type.provider';
import { SubtypeModule } from '../subtype/subtype.module';
import { UserContextModule } from '../user-context/user-context.module';
import { S3Module } from '../s3/s3.module';
import { AuditLogModule } from '../audit_log/audit_log.module';

@Module({
  controllers: [TypeController],
  providers: [TypeService, ...TypeProvider],
  imports: [
    S3Module,
    forwardRef(()=>UserContextModule),
    forwardRef(() => SubtypeModule),
    AuditLogModule
  ],
  exports: [TypeService],
})
export class TypeModule {}
