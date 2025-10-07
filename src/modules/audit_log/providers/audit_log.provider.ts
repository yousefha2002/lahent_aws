import { repositories } from 'src/common/enums/repositories';
import { AuditLog } from '../entities/audit_log.entity';
export const AuditLogProvider = [
    {
        provide: repositories.audit_log_repository,
        useValue: AuditLog,
    },
];
