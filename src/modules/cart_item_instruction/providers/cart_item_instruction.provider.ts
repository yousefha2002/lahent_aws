import { repositories } from 'src/common/enums/repositories';
import { CartItemInstruction } from '../entities/cart_item_instruction.entity';
export const CartItemInstructionProvider = [
    {
        provide: repositories.cartItemInstruction_repository,
        useValue: CartItemInstruction,
    },
];
