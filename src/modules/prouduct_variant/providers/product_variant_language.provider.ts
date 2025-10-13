import { repositories } from 'src/common/enums/repositories';
import { ProductVariantLanguage } from '../entities/product_variant_language.entity';
export const ProductVariantLanguageProvider = [
    {
        provide: repositories.productVariantLanguage_repository,
        useValue: ProductVariantLanguage,
    },
];