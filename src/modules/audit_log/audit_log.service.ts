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
        }) {
        const {
            actor,
            entity,
            action,
            oldEntity = null,
            newEntity = null,
            entityId,
            fieldsToExclude = [],
        } = params;

        let oldData: Record<string, any> | null = null;
        let newData: Record<string, any> | null = null;
        console.log(oldEntity)
        console.log(newEntity)

        // 🔹 فلترة عميقة لأي كائن أو مصفوفة
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

        // 🔹 مقارنة القيم لتسجيل التغييرات
        const getChanges = (
            oldVal: any,
            newVal: any,
            exclude: string[] = []
        ): { old?: any; new?: any } | null => {
            if (Array.isArray(newVal) && Array.isArray(oldVal)) {
            const oldArr: any[] = [];
            const newArr: any[] = [];

            for (let i = 0; i < newVal.length; i++) {
                const oldItem = oldVal[i] || {};
                const newItem = newVal[i];
                const itemChanges: any = {};
                const itemOld: any = {};

                for (const key of Object.keys(newItem)) {
                if (exclude.includes(key)) continue;
                if (oldItem[key] !== newItem[key]) {
                    itemChanges[key] = newItem[key];
                    itemOld[key] = oldItem[key];
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

        // 🔹 التعامل مع أنواع العمليات
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
        } 
        else if (action === AuditLogAction.CREATE && newEntity) {
            // ✅ فلترة عميقة للإنشاء
            newData = excludeFieldsDeep(newEntity, fieldsToExclude);
        } 
        else if (action === AuditLogAction.DELETE && oldEntity) {
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