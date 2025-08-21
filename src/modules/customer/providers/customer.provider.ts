import { repositories } from 'src/common/enums/repositories';
import { Customer } from '../entities/customer.entity';
export const CustomerProvider = [
    {
        provide: repositories.customer_repository,
        useValue: Customer,
    },
];