import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { ProuductVariantService } from '../prouduct_variant/prouduct_variant.service';
import { Transaction } from 'sequelize';
import { CartItemVariant } from './entities/cart_item_variant.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CartItemVariantService {
  constructor(
    @Inject(repositories.cartItemVariant_repository)
    private cartItemVariantRepo: typeof CartItemVariant,
    private readonly productVariantsService: ProuductVariantService,
    private readonly i18n: I18nService, // إضافة خدمة i18n
  ) {}

  async insertVariantsItemsForCart(
    variants: number[],
    cartItemId: number,
    productId: number,
    transaction: Transaction,
    lang: Language = Language.en, // لغة افتراضية
  ) {
    if (!variants || variants.length === 0) return;

    const existingVariants =
      await this.productVariantsService.findExistingVariants(
        variants,
        productId,
      );

    const existingVariantIds = existingVariants.map((e) => e.id);

    const invalidIds = variants.filter(
      (id) => !existingVariantIds.includes(id),
    );

    if (invalidIds.length > 0) {
      const message = this.i18n.translate(
        'translation.cart.variant_not_found',
        { lang, args: { ids: invalidIds.join(', ') } },
      );
      throw new NotFoundException(message);
    }

    const itemsToInsert = variants.map((varId) => ({
      cartItemId,
      productVariantId: varId,
    }));

    await this.cartItemVariantRepo.bulkCreate(itemsToInsert, { transaction });
  }

  async destroyAll(cartItemId: number, transaction: Transaction) {
    await this.cartItemVariantRepo.destroy({ where: { cartItemId }, transaction });
  }
}