import { repositories } from 'src/common/enums/repositories';
import { ProductInstruction } from '../entities/product_instruction.entity';
export const ProductInstructionProvider = [
    {
        provide: repositories.productInstruction_repository,
        useValue: ProductInstruction,
    },
];