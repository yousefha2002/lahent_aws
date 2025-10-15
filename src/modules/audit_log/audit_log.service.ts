import { AuditLog } from 'src/modules/audit_log/entities/audit_log.entity';
import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { RoleStatus } from 'src/common/enums/role_status';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class AuditLogService {
    constructor(
        @Inject(repositories.audit_log_repository) private auditLogRepo: typeof AuditLog,
    ){}

    async logChange(params: {
    actor: { id: number; type: RoleStatus };
    entity: AuditLogEntity;
    action: AuditLogAction;
    oldEntity?: any | null; 
    newEntity?: any | null;
    entityId?: number;   
    }) {
    const { actor, entity, action, oldEntity = null, newEntity = null, entityId } = params;

    let oldData: Record<string, any> | null = null;
    let newData: Record<string, any> | null = null;

    if (action === AuditLogAction.UPDATE && oldEntity && newEntity) {
        oldData = {};
        newData = {};
        for (const key of Object.keys(newEntity)) {
            if (JSON.stringify(oldEntity[key]) !== JSON.stringify(newEntity[key])) {
                oldData[key] = oldEntity[key];
                newData[key] = newEntity[key];
            }
        }
        } else if (action === AuditLogAction.CREATE && newEntity) {
        newData = { ...newEntity };
        } else if (action === AuditLogAction.DELETE && oldEntity) {
        oldData = { ...oldEntity };
        }

        return this.auditLogRepo.create({
        userId: actor.id,
        userRole: actor.type,
        entity,
        entityId: entityId ?? newEntity?.id ?? oldEntity?.id ?? null,
        action,
        oldData,
        newData,
        });
    }
}
