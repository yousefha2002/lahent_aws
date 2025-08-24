import { repositories } from 'src/common/enums/repositories';
import { StoreLanguage } from '../entities/store_language.entity';
export const StoreLanguageProvider = [
    {
        provide: repositories.store_langauge_repository,
        useValue: StoreLanguage,
    },
];