import { repositories } from 'src/common/enums/repositories';
import { Store } from '../entities/store.entity';
export const StoreProvider = [
    {
        provide: repositories.store_repository,
        useValue: Store,
    },
];