import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltySetting } from './entities/loyalty_setting.entity';
import { CreateLoyaltySettingDto } from './dto/create_loyalty_setting.dto';
import { AuditLogService } from '../audit_log/audit_log.service';
import { ActorInfo } from 'src/common/types/current-user.type';
import { AuditLogAction, AuditLogEntity } from 'src/common/enums/audit_log';

@Injectable()
export class LoyaltySettingService {
    constructor(
        @Inject(repositories.loyalty_setting_repository) private loyaltySettingRepo: typeof LoyaltySetting,
        private readonly auditLogService:AuditLogService
    ){}

    async createOrUpdate(dto:CreateLoyaltySettingDto,actor:ActorInfo) {
        const {pointsPerCurrency,currencyPerPoint,pointsPerInviteAcceptance} = dto
        const existing = await this.loyaltySettingRepo.findOne();
        if (existing) {
            const oldEntity = { ...existing.get({ plain: true }) };
            existing.pointsPerCurrency = pointsPerCurrency;
            existing.currencyPerPoint = currencyPerPoint;
            existing.pointsPerInviteAcceptance = pointsPerInviteAcceptance
            await existing.save();
            const newEntity = { ...existing.get({ plain: true }) };
            await this.auditLogService.logChange({
                actor,
                entity: AuditLogEntity.POINTSSYSTEM,
                action: AuditLogAction.UPDATE,
                oldEntity,
                newEntity,
                fieldsToExclude: ['createdAt', 'updatedAt'],
            });
            return existing;
        }
        const newSetting = await this.loyaltySettingRepo.create({ pointsPerCurrency, currencyPerPoint,pointsPerInviteAcceptance });
        return newSetting;
    }

    async getSettings() {
        const settings = await this.loyaltySettingRepo.findOne();
        if (!settings) {
        throw new BadRequestException('Loyalty settings not configured yet.');
        }
        return settings;
    }
}
