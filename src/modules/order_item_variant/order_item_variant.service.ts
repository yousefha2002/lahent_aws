import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OrderItemVariant } from './entities/order_item_variant.entity';

@Injectable()
export class OrderItemVariantService {
    constructor(
        @Inject(repositories.order_item_varaint_repository) private orderItemVariantRepo: typeof OrderItemVariant
    ){}
    async createVariants(orderItemId: number, variants: { id: number; name: string; type: string; priceDiff: number; imageUrl?: string|null }[],transaction?: any) {
        const creations = variants.map(variant => this.orderItemVariantRepo.create({
        orderItemId,
        variantId: variant.id,
        name: variant.name,
        type: variant.type,
        priceDiff: variant.priceDiff,
        imageUrl:variant.imageUrl
        },{transaction}));
        return Promise.all(creations);
    }
}
