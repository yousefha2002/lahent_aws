import { repositories } from 'src/common/enums/repositories';
import { OrderItemVariant } from '../entities/order_item_variant.entity';
export const OrderItemVariantProvider = [
    {
        provide: repositories.order_item_varaint_repository,
        useValue: OrderItemVariant,
    },
];