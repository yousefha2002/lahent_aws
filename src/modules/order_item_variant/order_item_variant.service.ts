import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OrderItemVariant } from './entities/order_item_variant.entity';

@Injectable()
export class OrderItemVariantService {
    constructor(
        @Inject(repositories.order_item_varaint_repository) private orderItemVariantRepo: typeof OrderItemVariant
    ){}
    async createVariants(orderItemId: number, variants: { id: number; name: string; additional_price: number; imageUrl?: string|null }[],transaction?: any) {
        const creations = variants.map(variant => this.orderItemVariantRepo.create({
        orderItemId,
        variantId: variant.id,
        name: variant.name,
        additional_price: variant.additional_price,
        imageUrl:variant.imageUrl
        },{transaction}));
        return Promise.all(creations);
    }
}
