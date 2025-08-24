import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OrderItem } from './entities/order_item.entity';

@Injectable()
export class OrderItemService {
    constructor(
        @Inject(repositories.order_item_repository) private orderItemRepo: typeof OrderItem
    ){}

    async createOrderItem(data: {
        orderId: number;
        productId: number;
        productName: string;
        productImageUrl: string;
        unitBasePrice: number;
        unitDiscountedPrice:number,
        unitFinalPrice:number,
        finalSubtotal:number,
        quantity: number;
        freeQty?: number;
        offerId?: number | null;
        note?:string|null
    },transaction?: any){
        return this.orderItemRepo.create({
        orderId: data.orderId,
        productId: data.productId,
        productName: data.productName,
        productImageUrl: data.productImageUrl,
        unitBasePrice: data.unitBasePrice,
        unitDiscountedPrice: data.unitDiscountedPrice,
        unitFinalPrice: data.unitFinalPrice,
        finalSubtotal: data.finalSubtotal,
        quantity: data.quantity,
        freeQty: data.freeQty ?? 0,
        offerId: data.offerId ?? null,
        note:data.note
    },
    { transaction });
    }
}
