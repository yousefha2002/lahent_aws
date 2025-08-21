import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProductInstruction } from './entities/product_instruction.entity';
import { Transaction } from 'sequelize';
import { ProductService } from '../product/product.service';
import { UpdateProductInstructionDto } from './dto/update-product-instruction.sto';

@Injectable()
export class ProductInstructionService {
  constructor(
    @Inject(repositories.productInstruction_repository)
    private productInstructionRepo: typeof ProductInstruction,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
  ) {}

  async insertInstructionsForProduct(
    productId: number,
    instructions: string[],
    transaction: Transaction,
  ) {
    await this.productInstructionRepo.bulkCreate(
      instructions.map((instruction) => ({
        productId,
        text: instruction,
      })),
      { transaction },
    );
  }

  async findExistingInstructions(instructions: number[], productId: number) {
    const existingExtras = await this.productInstructionRepo.findAll({
      where: { id: instructions, productId: productId },
      attributes: ['id'],
    });
    return existingExtras;
  }

  async updateInstructionProduct(
    extraId: number,
    dto: UpdateProductInstructionDto,
  ) {
    const [instruction, product] = await Promise.all([
      this.productInstructionRepo.findByPk(extraId),
      this.productService.productById(dto.productId),
    ]);
    if (!instruction || instruction.productId !== dto.productId) {
      throw new BadRequestException('Instruction Product not found');
    }
    Object.assign(instruction, dto);
    await instruction.save();
    return { message: 'updated successed' };
  }

  async updateIsActive(extraId: number, isActive: boolean) {
    const instruction = await this.productInstructionRepo.findByPk(extraId);
    if (!instruction) {
      throw new BadRequestException('Extra Product not found');
    }
    instruction.isActive = isActive;
    await instruction.save();
    return { message: 'active status updated' };
  }

  async deleteInstructionProduct(extraId: number) {
    await this.productInstructionRepo.destroy({ where: { id: extraId } });
    return { message: 'deleted successed' };
  }

  async createSingleInstruction(dto: UpdateProductInstructionDto) {
    await this.productService.productById(dto.productId);
    const created = await this.productInstructionRepo.create({
      text: dto.text,
      productId: dto.productId,
    });
    return created;
  }
}
