import { repositories } from 'src/common/enums/repositories';
import { OrderItemInstruction } from '../entities/order_item_instruction.entity';
export const OrderItemInstructionProvider = [
    {
        provide: repositories.order_item_instruction_repository,
        useValue: OrderItemInstruction,
    },
];