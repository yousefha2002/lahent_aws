import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { StoreCommission } from './entities/store_commission.entity';

@Injectable()
export class StoreCommissionService {
    constructor(
        @Inject(repositories.store_commission_repository)
        private storeCommissionRepo: typeof StoreCommission,
    ) {}

    // create one for each store - update and create in the same function
    // if is created update or create
}