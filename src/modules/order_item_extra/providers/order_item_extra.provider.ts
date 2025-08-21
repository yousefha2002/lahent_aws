import { repositories } from 'src/common/enums/repositories';
import { OrderItemExtra } from '../entities/order_item_extra.entity';
export const OrderItemExtraProvider = [
    {
        provide: repositories.order_item_extra_repository,
        useValue: OrderItemExtra,
    },
];