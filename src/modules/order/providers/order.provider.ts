import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
export const OrderProvider = [
    {
        provide: repositories.order_repository,
        useValue: Order,
    },
];