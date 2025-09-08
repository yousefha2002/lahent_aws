import { repositories } from 'src/common/enums/repositories';
import { LoyaltySetting } from '../entities/loyalty_setting.entity';

export const LoyaltySettingProvider = [
    {
        provide: repositories.loyalty_setting_repository,
        useValue: LoyaltySetting,
    },
];