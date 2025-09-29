import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltySetting } from './entities/loyalty_setting.entity';

@Injectable()
export class LoyaltySettingService {
    constructor(
        @Inject(repositories.loyalty_setting_repository) private loyaltySettingRepo: typeof LoyaltySetting
    ){}

    async createOrUpdate(pointsPerCurrency: number, currencyPerPoint: number) {
        const existing = await this.loyaltySettingRepo.findOne();
        if (existing) {
            existing.pointsPerCurrency = pointsPerCurrency;
            existing.currencyPerPoint = currencyPerPoint;
            await existing.save();
            return existing;
        }
        const newSetting = await this.loyaltySettingRepo.create({ pointsPerCurrency, currencyPerPoint });
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
