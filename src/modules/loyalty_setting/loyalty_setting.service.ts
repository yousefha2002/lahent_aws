import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { LoyaltySetting } from './entities/loyalty_setting.entity';

@Injectable()
export class LoyaltySettingService {
    constructor(
        @Inject(repositories.loyalty_setting_repository) private loyaltySettingRepo: typeof LoyaltySetting
    ){}

    // create just one then update on it , not more than one
}
