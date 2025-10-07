import { Controller } from '@nestjs/common';
import { AuditLogService } from './audit_log.service';

@Controller('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}
}
