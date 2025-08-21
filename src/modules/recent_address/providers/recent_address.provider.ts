import { repositories } from 'src/common/enums/repositories';
import { RecentAddress } from '../entities/recent_address.entity';
export const RecentAddressProvider = [
    {
        provide: repositories.recent_address_repository,
        useValue: RecentAddress,
    },
];
