import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OrderItemExtra } from './entities/order_item_extra.entity';

@Injectable()
export class OrderItemExtraService {
    constructor(
        @Inject(repositories.order_item_extra_repository) private orderItemExtraRepo: typeof OrderItemExtra
    ){}
    async createExtras(orderItemId: number, extras: { id: number; name: string; additionalPrice: number }[],transaction?: any) {
        const creations = extras.map(extra => this.orderItemExtraRepo.create({
            orderItemId,
            extraId: extra.id,
            name: extra.name,
            additionalPrice: extra.additionalPrice,
        },{ transaction }));
        return Promise.all(creations);
    }
}
