import { repositories } from 'src/common/enums/repositories';
import { Owner } from '../entities/owner.entity';
export const OwnerProvider = [
    {
        provide: repositories.owner_repository,
        useValue: Owner,
    },
];