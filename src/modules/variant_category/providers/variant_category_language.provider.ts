import { repositories } from 'src/common/enums/repositories';
import { VariantCategoryLanguage } from '../entities/variant_category_language.entity';

export const VariantCategoryLanguageProvider = [
    {
        provide: repositories.variant_category_language_repository,
        useValue: VariantCategoryLanguage,
    },
];