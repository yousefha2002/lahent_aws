import { repositories } from 'src/common/enums/repositories';
import { CategoryLanguage } from '../entities/category_language.entity';
export const CategoryLanguageProvider = [
    {
        provide: repositories.category_langauge_repository,
        useValue: CategoryLanguage,
    },
];