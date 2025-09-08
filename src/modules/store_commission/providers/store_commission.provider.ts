import { repositories } from 'src/common/enums/repositories';
import { StoreCommission } from '../entities/store_commission.entity';

export const StoreCommissionProvider = [
    {
        provide: repositories.store_commission_repository,
        useValue: StoreCommission,
    },
];