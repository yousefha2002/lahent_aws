import { repositories } from 'src/common/enums/repositories';
import { ProductCategoryVariant } from '../entities/product_category_variant.entity';
export const ProductVariantCategoryProvider = [
    {
        provide: repositories.product_category_variant_repository,
        useValue: ProductCategoryVariant,
    },
];