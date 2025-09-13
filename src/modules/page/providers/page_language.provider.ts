import { repositories } from 'src/common/enums/repositories';
import { PageLanguage } from '../entities/page_language.entity';
export const PageLanguageProvider = [
    {
        provide: repositories.pageLanguage_repository,
        useValue: PageLanguage,
    },
];