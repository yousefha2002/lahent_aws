import { ProductService } from './../product/product.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OfferCategory } from './entites/offer_category.entity';

@Injectable()
export class OfferCategoryService {
    constructor(
        @Inject(repositories.offer_category_repository)
        private offerCategoryRepo: typeof OfferCategory,
    ) {}

    async linkCategoriesToOffer(offerId: number, categoryIds: number[]) {
        const records = categoryIds.map(categoryId => ({
        offerId,
        categoryId,
        }));
        await this.offerCategoryRepo.bulkCreate(records);
    }
}