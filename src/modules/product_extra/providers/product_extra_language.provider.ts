import { repositories } from 'src/common/enums/repositories';
import { ProductExtra } from '../entities/product_extra.entity';
import { ProductExtraLanguage } from '../entities/product_extra_language.entity';
export const ProductExtraLanguageProvider = [
    {
        provide: repositories.productExtraLanguage_repository,
        useValue: ProductExtraLanguage,
    },
];