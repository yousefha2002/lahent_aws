import { repositories } from 'src/common/enums/repositories';
import { CartItemExtra } from '../entities/cart_item.entity';
export const CartItemExtraProvider = [
    {
        provide: repositories.cartItemExtra_repository,
        useValue: CartItemExtra,
    },
];
