import { repositories } from 'src/common/enums/repositories';
import { ProductVariant } from '../entities/prouduct_variant.entity';
export const ProductVariantProvider = [
    {
        provide: repositories.productVariant_repository,
        useValue: ProductVariant,
    },
];