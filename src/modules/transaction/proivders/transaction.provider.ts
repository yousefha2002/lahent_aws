import { repositories } from 'src/common/enums/repositories';
import { Transaction } from '../entities/transaction.entity';
export const TransactionProvider = [
    {
        provide: repositories.transaction_repository,
        useValue: Transaction,
    },
];