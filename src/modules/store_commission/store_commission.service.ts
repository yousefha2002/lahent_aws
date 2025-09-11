import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { StoreCommission } from './entities/store_commission.entity';

@Injectable()
export class StoreCommissionService {
    constructor(
        @Inject(repositories.store_commission_repository)
        private storeCommissionRepo: typeof StoreCommission,
    ) {}

    async setCommission(storeId: number, commissionPercent: number){
        const existing = await this.storeCommissionRepo.findOne({ where: { storeId } });
        if (existing) {
            existing.commissionPercent = commissionPercent;
            return existing.save();
        }

        return this.storeCommissionRepo.create({
            storeId,
            commissionPercent,
        });
    }

    async getCommission(storeId: number){
        const commission = await this.storeCommissionRepo.findOne({ where: { storeId } });
        if(!commission)
        {
            throw new BadRequestException('comission for store is not found')
        }
        return commission.commissionPercent
    }

    softDeleteCommission(storeId:number,transaction?:any)
    {
        return this.storeCommissionRepo.destroy({where: { storeId},transaction})
    }
}