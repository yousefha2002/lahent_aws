import { Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { OrderItemInstruction } from './entities/order_item_instruction.entity';

@Injectable()
export class OrderItemInstructionService {
    constructor(
        @Inject(repositories.order_item_instruction_repository) private orderItemInstructionRepo: typeof OrderItemInstruction
    ){}

    async createInstructions(orderItemId: number, instructions: { id: number; text: string }[],transaction?: any) {
        const creations = instructions.map(instruction => this.orderItemInstructionRepo.create({
        orderItemId,
        instructionId: instruction.id,
        text: instruction.text,
        },{transaction}));
        return Promise.all(creations);
    }
}
