import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltySetting } from './entities/loyalty_setting.entity';
import { CreateLoyaltySettingDto } from './dto/create_loyalty_setting.dto';

@Injectable()
export class LoyaltySettingService {
    constructor(
        @Inject(repositories.loyalty_setting_repository) private loyaltySettingRepo: typeof LoyaltySetting
    ){}

    async createOrUpdate(dto:CreateLoyaltySettingDto) {
        const {pointsPerCurrency,currencyPerPoint,pointsPerInviteAcceptance} = dto
        const existing = await this.loyaltySettingRepo.findOne();
        if (existing) {
            existing.pointsPerCurrency = pointsPerCurrency;
            existing.currencyPerPoint = currencyPerPoint;
            existing.pointsPerInviteAcceptance = pointsPerInviteAcceptance
            await existing.save();
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
