import { repositories } from 'src/common/enums/repositories';
import { VariantCategory } from '../entities/variant_category.entity';
export const VariantCategoryProvider = [
    {
        provide: repositories.variant_category_repository,
        useValue: VariantCategory,
    },
];