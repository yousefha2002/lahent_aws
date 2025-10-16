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

        if (action === AuditLogAction.UPDATE && oldEntity && newEntity) {
            oldData = {};
            newData = {};

            for (const key of Object.keys(newEntity)) {
            if (fieldsToExclude.includes(key)) continue;

            const oldValue = oldEntity[key];
            const newValue = newEntity[key];

            if (typeof newValue === 'object' && newValue !== null) {
                // ✅ دعم خاص لـ translations
                if (key === 'translations') {
                for (const lang of Object.keys(newValue)) {
                    const oldLang = oldValue?.[lang] || {};
                    const newLang = newValue[lang] || {};

                    for (const subKey of Object.keys(newLang)) {
                    const oldVal = oldLang[subKey];
                    const newVal = newLang[subKey];

                    if (oldVal !== newVal) {
                        if (!oldData.translations) oldData.translations = {};
                        if (!newData.translations) newData.translations = {};

                        if (!oldData.translations[lang]) oldData.translations[lang] = {};
                        if (!newData.translations[lang]) newData.translations[lang] = {};

                        oldData.translations[lang][subKey] = oldVal;
                        newData.translations[lang][subKey] = newVal;
                    }
                    }
                }
                }

                // تجاهل أي object ثاني غير translations
                continue;
            }

            // مقارنة القيم العادية
            if (oldValue !== newValue) {
                oldData[key] = oldValue;
                newData[key] = newValue;
            }
            }

            // لا تسجل التغيير إذا ما صار تغيير فعلي
            if (
            Object.keys(newData).length === 0 &&
            Object.keys(oldData).length === 0
            ) {
            return null;
            }

        } else if (action === AuditLogAction.CREATE && newEntity) {
            newData = { ...newEntity };
        } else if (action === AuditLogAction.DELETE && oldEntity) {
            oldData = { ...oldEntity };
        }

        // حفظ السجل في جدول audit_logs
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
