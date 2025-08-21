import { repositories } from 'src/common/enums/repositories';
import { Cart } from '../entities/cart.entity';
export const CartProvider = [
    {
        provide: repositories.cart_repository,
        useValue: Cart,
    },
];