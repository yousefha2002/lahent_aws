import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductInstruction } from './entities/product_instruction.entity';
import { Sequelize, } from 'sequelize';
import { ProductService } from '../product/product.service';
import { UpdateProductInstructionDto } from './dto/update-product-instruction.sto';
import { Product } from '../product/entities/product.entity';
import { ProductInstructionLanguage } from './entities/product_instruction_language.dto';
import { CreateProductInstructionDto } from './dto/create-product-instruction.dto';
import { validateRequiredLanguages, validateUniqueLanguages } from 'src/common/validators/translation-validator.';

@Injectable()
export class ProductInstructionService {
  constructor(
    @Inject(repositories.productInstruction_repository) private productInstructionRepo: typeof ProductInstruction,
    @Inject(repositories.productInstructionLanguage_repository) private productInstructionLanguageRepo: typeof ProductInstructionLanguage,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize
  ) {}

  async createProductInstructions(dto: CreateProductInstructionDto, storeId: number) 
  {
    const product = await this.productService.productById(dto.productId);
    if (product.storeId !== storeId) {
      throw new BadRequestException('Invalid Process');
    }
    const codes = dto.languages.map(l => l.languageCode);
    validateRequiredLanguages(codes, 'product instruction languages');

    const instruction = await this.productInstructionRepo.create(
      { productId: dto.productId },
      { transaction: null }
    );

    await Promise.all(
      dto.languages.map(lang =>
        this.productInstructionLanguageRepo.create({
          productInstructionId: instruction.id,
          languageCode: lang.languageCode,
          name: lang.name,
        })
      )
    );

    return {message:"product instructions has been created"};
  }

  async updateProductInstruction(instructionId: number,dto: UpdateProductInstructionDto,storeId: number) 
  {
    const transaction = await this.sequelize.transaction();

    try {
      const [instruction, product] = await Promise.all([
        this.productInstructionRepo.findByPk(instructionId, {
          include: [{ model: this.productInstructionLanguageRepo }]
        }),
        this.productService.productById(dto.productId)
      ]);

      if (!instruction || instruction.productId !== dto.productId) {
        throw new BadRequestException('Instruction not found');
      }
      if (product.storeId !== storeId) {
        throw new BadRequestException('Invalid Process');
      }
      const codes = dto.languages.map(l => l.languageCode);
      validateUniqueLanguages(codes, 'product instruction languages');

      for (const lang of dto.languages) {
        const existingLang = instruction.languages.find(l => l.languageCode === lang.languageCode);
        if (existingLang) {
          existingLang.name = lang.name;
          await existingLang.save({ transaction });
        } else {
          await this.productInstructionLanguageRepo.create(
            {
              productInstructionId: instruction.id,
              languageCode: lang.languageCode,
              name: lang.name
            },
            { transaction }
          );
        }
      }

      await transaction.commit();
      return { message: 'Instruction updated successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateIsActive(extraId: number, storeId: number) {
    const instruction = await this.productInstructionRepo.findByPk(extraId, {
      include: [{ model: Product }],
    });
    if (!instruction) {
      throw new BadRequestException('Extra Product not found');
    }
    if (instruction.product.storeId !== storeId) {
      throw new BadRequestException('Invalid Process');
    }
    instruction.isActive = !instruction.isActive;
    await instruction.save();
    return { message: 'active status updated' };
  }

  async findExistingInstructions(instructions: number[], productId: number) {
    const existingExtras = await this.productInstructionRepo.findAll({
      where: { id: instructions, productId: productId },
      attributes: ['id'],
    });
    return existingExtras;
  }
}
