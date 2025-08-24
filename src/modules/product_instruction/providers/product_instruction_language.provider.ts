import { repositories } from 'src/common/enums/repositories';
import { ProductInstruction } from '../entities/product_instruction.entity';
import { ProductInstructionLanguage } from '../entities/product_instruction_language.dto';
export const ProductInstructionLanguageProvider = [
    {
        provide: repositories.productInstructionLanguage_repository,
        useValue: ProductInstructionLanguage,
    },
];