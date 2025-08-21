import { repositories } from 'src/common/enums/repositories';
import { Address } from '../entities/address.entity';
export const AddressProvider = [
    {
        provide: repositories.address_repository,
        useValue: Address,
    },
];
