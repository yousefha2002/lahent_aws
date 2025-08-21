import { repositories } from 'src/common/enums/repositories';
import { CartItem } from '../entities/cart_item.entity';
export const CartItemProvider = [
    {
        provide: repositories.cartItem_repository,
        useValue: CartItem,
    },
];
