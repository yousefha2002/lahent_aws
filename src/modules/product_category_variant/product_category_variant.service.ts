import { ProductCategoryVariant } from 'src/modules/product_category_variant/entities/product_category_variant.entity';
import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';

@Injectable()
export class ProductCategoryVariantService {
    constructor(
        @Inject(repositories.product_category_variant_repository) private productVariantCategoryRepo: typeof ProductCategoryVariant
    ){}

    async findOrCreate(productId: number,variantCategoryId: number,transaction?: any): Promise<[ProductCategoryVariant, boolean]> {
        return this.productVariantCategoryRepo.findOrCreate({
        where: { productId, variantCategoryId },
        defaults: { productId, variantCategoryId },
        transaction,
    });
}
}
