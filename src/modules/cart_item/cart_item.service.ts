import { OfferService } from './../offer/offer.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { CartItem } from './entities/cart_item.entity';
import { Transaction } from 'sequelize';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../product/entities/product.entity';
import { ProductImage } from '../product_image/entities/product_image.entity';
import { CartItemExtra } from '../cart_item_extra/entities/cart_item.entity';
import { CartItemVariant } from '../cart_item_variant/entities/cart_item_variant.entity';
import { CartItemInstruction } from '../cart_item_instruction/entities/cart_item_instruction.entity';
import { ProductExtra } from '../product_extra/entities/product_extra.entity';
import { ProductVariant } from '../prouduct_variant/entities/prouduct_variant.entity';
import { ProductInstruction } from '../product_instruction/entities/product_instruction.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Category } from '../category/entities/category.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';

@Injectable()
export class CartItemService {
  constructor(
    @Inject(repositories.cartItem_repository)
    private cartItemRepo: typeof CartItem,
    private offerService: OfferService,
    private readonly i18n: I18nService,
  ) {}

  async insertProductinCart(cartId: number, productId: number, quantity: number, transaction: Transaction) {
    return this.cartItemRepo.create({ cartId, productId, quantity }, { transaction });
  }

  async findCartItem(cartItemId: number, lang = Language.en) {
    const cartItem = await this.cartItemRepo.findByPk(cartItemId);
    if (!cartItem) {
      const message = this.i18n.translate('translation.cart_item_invalid', { lang });
      throw new BadRequestException(message);
    }
    return cartItem;
  }

  async findCartItemWithCustomer(cartItemId: number, lang = Language.en) {
    const cartItem = await this.cartItemRepo.findByPk(cartItemId, {
      include: [{ model: Cart, include: [{ model: Customer }] }],
    });
    if (!cartItem) {
      const message = this.i18n.translate('translation.cart_item_invalid', { lang });
      throw new BadRequestException(message);
    }
    return cartItem;
  }

  async findAllItemsByCartIdAndCustomerId(cartId: number, customerId: number) {
    return this.cartItemRepo.findAll({
      include: [
        { model: Cart, where: { customerId, id: cartId } },
        { model: CartItemExtra, include: [{ model: ProductExtra, where: { isActive: true } }] },
        { model: CartItemVariant, include: [{ model: ProductVariant, where: { isActive: true } }] },
        { model: CartItemInstruction, include: [{ model: ProductInstruction, where: { isActive: true } }] },
        {
          model: Product,
          include: [
            { model: ProductImage, limit: 1, order: [['id', 'ASC']] },
            { model: Category },
          ],
          where: { isActive: true },
        },
      ],
    });
  }

  async getCartItemWithProductOptions(cartItemId: number, customerId: number, lang = Language.en) {
    const cartItem = await this.cartItemRepo.findOne({
      where: { id: cartItemId },
      include: [
        { model: Cart, where: { customerId } },
        { model: CartItemExtra, include: [{ model: ProductExtra, where: { isActive: true } }] },
        { model: CartItemVariant, include: [{ model: ProductVariant, where: { isActive: true } }] },
        { model: CartItemInstruction, include: [{ model: ProductInstruction, where: { isActive: true } }] },
        { model: Product, include: [
            { model: ProductExtra, where: { isActive: true } },
            { model: ProductVariant, where: { isActive: true } },
            { model: ProductInstruction, where: { isActive: true } },
            { model: ProductImage },
          ] 
        },
      ],
    });

    if (!cartItem) {
      const message = this.i18n.translate('translation.cart_item_not_found', { lang });
      throw new BadRequestException(message);
    }

    const offer = await this.offerService.getActiveOfferForProduct(cartItem.product.id);

    const selectedExtrasIds = new Set(cartItem.extras.map(e => e.productExtraId));
    const selectedVariantsIds = new Set(cartItem.variants.map(v => v.productVariantId));
    const selectedInstructionsIds = new Set(cartItem.instructions.map(i => i.productInstructionId));

    const extras = cartItem.product.extras.map(extra => ({
      ...extra.toJSON(),
      selected: selectedExtrasIds.has(extra.id),
    }));

    const variants = cartItem.product.variants.map(variant => ({
      ...variant.toJSON(),
      selected: selectedVariantsIds.has(variant.id),
    }));

    const instructions = cartItem.product.instructions.map(instruction => ({
      ...instruction.toJSON(),
      selected: selectedInstructionsIds.has(instruction.id),
    }));

    let discountedPrice = cartItem.product.basePrice;
    if (offer) {
      discountedPrice = this.offerService.getDiscountedPrice(cartItem.product.basePrice, offer);
    }

    const extrasTotal = cartItem.extras.reduce((sum, extra) => sum + (extra.productExtra?.price || 0), 0);
    const variantsTotal = cartItem.variants.reduce((sum, variant) => sum + (variant.productVariant?.priceDiff || 0), 0);
    const finalPrice = discountedPrice + extrasTotal + variantsTotal;
    const originalPrice = cartItem.product.basePrice + extrasTotal + variantsTotal;
    const totalPirce = finalPrice * cartItem.quantity

    return {
      cartItemId: cartItem.id,
      quantity: cartItem.quantity,
      originalPrice,
      finalPrice,
      totalPirce,
      product: {
        ...cartItem.product.toJSON(),
        discountedPrice,
        images: cartItem.product.images?.map(img => img.imageUrl) || [],
        offer: offer ?? null,
      },
      extras,
      variants,
      instructions,
    };
  }
}