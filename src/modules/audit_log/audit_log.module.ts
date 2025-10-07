import { Module } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';
import { AuditLogController } from './audit_log.controller';
import { AuditLogProvider } from './providers/audit_log.provider';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService,...AuditLogProvider],
})
export class AuditLogModule {}
