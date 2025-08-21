import { GiftCategory } from './../entites/gift_category.entity';
import { repositories } from 'src/common/enums/repositories';
export const GiftCategoryProvider = [
    {
        provide: repositories.gift_category_repository,
        useValue: GiftCategory,
    },
];