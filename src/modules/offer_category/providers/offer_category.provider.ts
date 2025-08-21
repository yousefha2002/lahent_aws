import { repositories } from 'src/common/enums/repositories';
import { OfferCategory } from '../entites/offer_category.entity';
export const OfferCategoryProvider = [
    {
        provide: repositories.offer_category_repository,
        useValue: OfferCategory,
    },
];