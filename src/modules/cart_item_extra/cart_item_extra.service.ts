import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CartItemExtra } from './entities/cart_item.entity';
import { ProductExtraService } from '../product_extra/product_extra.service';
import { Transaction } from 'sequelize';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CartItemExtraService {
  constructor(
    @Inject(repositories.cartItemExtra_repository)
    private cartItemExtraRepo: typeof CartItemExtra,

    private readonly productExtraService: ProductExtraService,
    private readonly i18n: I18nService,
  ) {}

  async insertExtraItemsForCart(
    extras: number[],
    cartItemId: number,
    productId: number,
    transaction: Transaction,
    lang: Language = Language.en,
  ) {
    if (!extras || extras.length === 0) return;

    const existingExtras = await this.productExtraService.findExistingExtras(
      extras,
      productId,
    );

    const existingExtraIds = existingExtras.map((e) => e.id);

    const invalidIds = extras.filter((id) => !existingExtraIds.includes(id));
    if (invalidIds.length > 0) {
      const message = this.i18n.translate('translation.cart.extra_not_found', {
        lang,
        args: { ids: invalidIds.join(', ') },
      });
      throw new NotFoundException(message);
    }

    const itemsToInsert = extras.map((extraId) => ({
      cartItemId,
      productExtraId: extraId,
    }));

    await this.cartItemExtraRepo.bulkCreate(itemsToInsert, { transaction });
  }

  async destroyAll(cartItemId: number, transaction: Transaction) {
    await this.cartItemExtraRepo.destroy({ where: { cartItemId }, transaction });
  }
}