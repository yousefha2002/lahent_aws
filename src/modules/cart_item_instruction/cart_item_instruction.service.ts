import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CartItem } from '../cart_item/entities/cart_item.entity';
import { Transaction } from 'sequelize';
import { ProductInstructionService } from '../product_instruction/product_instruction.service';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CartItemInstructionService {
  constructor(
    @Inject(repositories.cartItemInstruction_repository)
    private cartItemInstructionRepo: typeof CartItem,
    private readonly productInstructionRepo: ProductInstructionService,
    private readonly i18n: I18nService, // إضافة خدمة i18n
  ) {}

  async insertInstructionsItemsForCart(
    instructions: number[],
    cartItemId: number,
    productId: number,
    transaction: Transaction,
    lang: Language = Language.en, // لغة افتراضية
  ) {
    if (!instructions || instructions.length === 0) return;

    const existingInstructions =
      await this.productInstructionRepo.findExistingInstructions(
        instructions,
        productId,
      );

    const existingInstructionIds = existingInstructions.map((e) => e.id);

    // التحقق من التعليمات غير الموجودة
    const invalidIds = instructions.filter(
      (id) => !existingInstructionIds.includes(id),
    );

    if (invalidIds.length > 0) {
      const message = this.i18n.translate(
        'translation.cart.instruction_not_found',
        { lang, args: { ids: invalidIds.join(', ') } },
      );
      throw new NotFoundException(message);
    }

    // إعداد الصفوف للإضافة
    const itemsToInsert = instructions.map((instId) => ({
      cartItemId,
      productInstructionId: instId,
    }));

    await this.cartItemInstructionRepo.bulkCreate(itemsToInsert, {
      transaction,
    });
  }

  async destroyAll(cartItemId: number, transaction: Transaction) {
    await this.cartItemInstructionRepo.destroy({
      where: { cartItemId },
      transaction,
    });
  }
}