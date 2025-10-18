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
        fieldsToExclude?: string[];
        keyForArray?: string;
    }) {
        const {
            actor,
            entity,
            action,
            oldEntity = null,
            newEntity = null,
            entityId,
            fieldsToExclude = [],
            keyForArray = 'id',
        } = params;

        const excludeFieldsDeep = (obj: any, exclude: string[]): any => {
            if (Array.isArray(obj)) {
                return obj.map((item) => excludeFieldsDeep(item, exclude));
            } else if (obj && typeof obj === 'object') {
                const result: any = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (exclude.includes(key)) continue;
                    result[key] = excludeFieldsDeep(value, exclude);
                }
                return result;
            }
            return obj;
        };

        const getChanges = (
            oldVal: any,
            newVal: any,
            exclude: string[] = []
        ): { old?: any; new?: any } | null => {
            if (Array.isArray(newVal) && Array.isArray(oldVal)) {
                const oldMap = new Map((oldVal as any[]).map(item => [item[keyForArray], item]));
                const newMap = new Map((newVal as any[]).map(item => [item[keyForArray], item]));

                const oldArr: any[] = [];
                const newArr: any[] = [];

                for (const [key, newItem] of newMap.entries()) {
                    const oldItem = oldMap.get(key) || {};
                    const itemChanges: any = {};
                    const itemOld: any = {};

                    for (const k of Object.keys(newItem)) {
                        if (exclude.includes(k)) continue;
                        if (oldItem[k] !== newItem[k]) {
                            itemChanges[k] = newItem[k];
                            itemOld[k] = oldItem[k];
                        }
                    }

                    if (Object.keys(itemChanges).length > 0) {
                        oldArr.push(itemOld);
                        newArr.push(itemChanges);
                    }
                }

                return oldArr.length > 0 ? { old: oldArr, new: newArr } : null;
            } else if (
                typeof newVal === 'object' &&
                newVal !== null &&
                typeof oldVal === 'object' &&
                oldVal !== null
            ) {
                const changesOld: any = {};
                const changesNew: any = {};

                for (const key of Object.keys(newVal)) {
                    if (exclude.includes(key)) continue;
                    const changes = getChanges(oldVal[key], newVal[key], exclude);
                    if (changes) {
                        changesOld[key] = changes.old;
                        changesNew[key] = changes.new;
                    }
                }

                return Object.keys(changesOld).length > 0
                    ? { old: changesOld, new: changesNew }
                    : null;
            } else if (oldVal !== newVal) {
                return { old: oldVal, new: newVal };
            }

            return null;
        };

        let oldData: Record<string, any> | null = null;
        let newData: Record<string, any> | null = null;

        if (action === AuditLogAction.UPDATE && oldEntity && newEntity) {
            oldData = {};
            newData = {};

            for (const key of Object.keys(newEntity)) {
                if (fieldsToExclude.includes(key)) continue;

                const changes = getChanges(oldEntity[key], newEntity[key], fieldsToExclude);
                if (changes) {
                    oldData[key] = changes.old;
                    newData[key] = changes.new;
                }
            }

            if (Object.keys(oldData).length === 0 && Object.keys(newData).length === 0) {
                return null; 
            }
        } else if (action === AuditLogAction.CREATE && newEntity) {
            newData = excludeFieldsDeep(newEntity, fieldsToExclude);
        } else if (action === AuditLogAction.DELETE && oldEntity) {
            oldData = excludeFieldsDeep(oldEntity, fieldsToExclude);
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