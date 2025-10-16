import { AuditLogService } from './../audit_log/audit_log.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { SystemSetting } from './entities/system_setting.entity';
import { CreateSystemSettingDto } from './dto/create-system-setting.dto';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class SystemSettingService {
    constructor(
        @Inject(repositories.system_settings_repository) private systemSettingRepo: typeof SystemSetting,
        private readonly auditLogService:AuditLogService
    ){}

    async createOrUpdate(dto: CreateSystemSettingDto, actor: ActorInfo) {
        const { phoneNumber, email, country } = dto;
        const existing = await this.systemSettingRepo.findOne();
        
        if (existing) {
        const oldEntity = { ...existing.get({ plain: true }) };
            existing.phoneNumber = phoneNumber;
            existing.email = email;
            existing.country = country;
        await existing.save();

        const newEntity = { ...existing.get({ plain: true }) };
        await this.auditLogService.logChange({
            actor,
            entity: AuditLogEntity.SETTINGSSYSTEM,
            action: AuditLogAction.UPDATE,
            oldEntity,
            newEntity,
            fieldsToExclude: ['createdAt', 'updatedAt'],
        });
        return existing;
        }

        const newSetting = await this.systemSettingRepo.create({ phoneNumber, email, country });
        return newSetting;
    }

    async getSettings() {
        const settings = await this.systemSettingRepo.findOne();
        if (!settings) {
        throw new BadRequestException('System settings not configured yet.');
        }
        return settings;
    }
}