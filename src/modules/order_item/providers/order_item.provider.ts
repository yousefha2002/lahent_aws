import { repositories } from 'src/common/enums/repositories';
import { OrderItem } from '../entities/order_item.entity';
export const OrderItemProvider = [
    {
        provide: repositories.order_item_repository,
        useValue: OrderItem,
    },
];