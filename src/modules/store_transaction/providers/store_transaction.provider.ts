import { repositories } from 'src/common/enums/repositories';
import { StoreTransaction } from '../entities/store_transaction.entity';

export const StoreTransactionProvider = [
    {
        provide: repositories.store_transaction_repository,
        useValue: StoreTransaction,
    },
];