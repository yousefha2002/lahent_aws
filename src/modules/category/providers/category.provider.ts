import { repositories } from 'src/common/enums/repositories';
import { Category } from '../entities/category.entity';
export const CategoryProvider = [
    {
        provide: repositories.category_repository,
        useValue: Category,
    },
];