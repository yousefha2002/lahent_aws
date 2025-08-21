import { repositories } from 'src/common/enums/repositories';
import { CartItemVariant } from '../entities/cart_item_variant.entity';
export const CartItemVariantProvider = [
    {
        provide: repositories.cartItemVariant_repository,
        useValue: CartItemVariant,
    },
];
