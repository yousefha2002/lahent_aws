import { repositories } from 'src/common/enums/repositories';
import { ProductLanguage } from '../entities/product_language.entity';
export const ProductLanguageProvider = [
    {
        provide: repositories.product_language_repository,
        useValue: ProductLanguage,
    },
];