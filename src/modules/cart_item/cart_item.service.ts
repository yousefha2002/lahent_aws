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
import { ProductCategoryVariant } from '../product_category_variant/entities/product_category_variant.entity';
import { VariantCategory } from '../variant_category/entities/variant_category.entity';
import { ProductExtraLanguage } from '../product_extra/entities/product_extra_language.entity';
import { ProductVariantLanguage } from '../prouduct_variant/entities/product_variant_language.entity';
import { ProductInstructionLanguage } from '../product_instruction/entities/product_instruction_language.dto';
import { VariantCategoryLanguage } from '../variant_category/entities/variant_category_language.entity';
import { ProductLanguage } from '../product/entities/product_language.entity';
import { CategoryLanguage } from '../category/entities/category_language.entity';

@Injectable()
export class CartItemService {
  constructor(
    @Inject(repositories.cartItem_repository)
    private cartItemRepo: typeof CartItem,
    private offerService: OfferService,
    private readonly i18n: I18nService,
  ) {}

  async insertProductinCart(
    cartId: number,
    productId: number,
    quantity: number,
    transaction: Transaction,
    note?: string,
  ) {
    return this.cartItemRepo.create(
      { cartId, productId, quantity, note },
      { transaction },
    );
  }

  async findCartItem(cartItemId: number, lang = Language.en) {
    const cartItem = await this.cartItemRepo.findByPk(cartItemId);
    if (!cartItem) {
      const message = this.i18n.translate('translation.cart_item_invalid', {
        lang,
      });
      throw new BadRequestException(message);
    }
    return cartItem;
  }

  async findCartItemWithCustomer(cartItemId: number, lang = Language.en) {
    const cartItem = await this.cartItemRepo.findByPk(cartItemId, {
      include: [{ model: Cart, include: [{ model: Customer }] }],
    });
    if (!cartItem) {
      const message = this.i18n.translate('translation.cart_item_invalid', {
        lang,
      });
      throw new BadRequestException(message);
    }
    return cartItem;
  }

  async findAllItemsByCartIdAndCustomerId(cartId: number, customerId: number,lang=Language.ar) {
    return this.cartItemRepo.findAll({
      include: [
        { model: Cart, where: { customerId, id: cartId } },
        {
          model: CartItemExtra,
          include: [{ model: ProductExtra, where: { isActive: true },include:[{model:ProductExtraLanguage,where: { languageCode: lang }}]}],
        },
        {
          model: CartItemVariant,
          include: [{ model: ProductVariant, where: { isActive: true } ,include:[{model:ProductVariantLanguage,where: { languageCode: lang }}]}],
        },
        {
          model: CartItemInstruction,
          include: [{ model: ProductInstruction, where: { isActive: true },include:[{model:ProductInstructionLanguage,where: { languageCode: lang }}] }],
        },
        {
          model: Product,
          include: [
            { model: ProductImage, limit: 1, order: [['id', 'ASC']] },
            {model:ProductLanguage,where:{languageCode:lang}}
          ],
          where: { isActive: true },
        },
      ],
    });
  }

  async getCartItemWithProductOptions(cartItemId: number,customerId: number,lang: Language = Language.ar,) 
  {
    const cartItem = await this.cartItemRepo.findOne({
      where: { id: cartItemId },
      include: [
        { model: Cart, where: { customerId } },

        // CartItem Extras
        {
          model: CartItemExtra,
          include: [
            {
              model: ProductExtra,
              where: { isActive: true },
              include: [
                {
                  model: ProductExtraLanguage,
                  where: { languageCode: lang },
                  required: false,
                },
              ],
            },
          ],
        },

        // CartItem Variants
        {
          model: CartItemVariant,
          include: [
            {
              model: ProductVariant,
              where: { isActive: true },
              include: [
                {
                  model: ProductVariantLanguage,
                  where: { languageCode: lang },
                  required: false,
                },
              ],
            },
          ],
        },

        // CartItem Instructions
        {
          model: CartItemInstruction,
          include: [
            {
              model: ProductInstruction,
              where: { isActive: true },
              include: [
                {
                  model: ProductInstructionLanguage,
                  where: { languageCode: lang },
                  required: false,
                },
              ],
            },
          ],
        },

        // Product
        {
          model: Product,
          where: { isActive: true },
          include: [
            { model: ProductExtra, include: [{ model: ProductExtraLanguage, where: { languageCode: lang }, required: false }] },
            {
              model: ProductCategoryVariant,
              include: [
                { 
                  model: ProductVariant, 
                  include: [{ model: ProductVariantLanguage, where: { languageCode: lang }, required: false }] 
                },
                { 
                  model: VariantCategory, 
                  include: [{ model: VariantCategoryLanguage, where: { languageCode: lang }, required: false }]
                },
              ],
            },
            { model: ProductInstruction, include: [{ model: ProductInstructionLanguage, where: { languageCode: lang }, required: false }] },
            { model: ProductImage },
            { model: ProductLanguage, where: { languageCode: lang }, required: false },
            { model: Category, include: [{ model: CategoryLanguage, where: { languageCode: lang }, required: false }] },
          ],
        },
      ],
    });

    if (!cartItem) {
      throw new BadRequestException(this.i18n.translate('translation.cart_item_not_found', { lang }));
    }

    const offer = await this.offerService.getActiveOfferForProduct(cartItem.product.id);

    const selectedExtrasIds = new Set(cartItem.extras.map(e => e.productExtraId));
    const selectedVariantsIds = new Set(cartItem.variants.map(v => v.productVariantId));
    const selectedInstructionsIds = new Set(cartItem.instructions.map(i => i.productInstructionId));

    // Map extras
    const extras = cartItem.product.extras.map(extra => ({
      ...extra.toJSON(),
      selected: selectedExtrasIds.has(extra.id),
    }));

    // Map variants
    const variantCategories = cartItem.product.productCategoryVariants.map(catVar => ({
      id: catVar.variantCategoryId,
      languages: catVar.variantCategory.languages || [],
      variants: catVar.variants.map(v => ({
        id: v.id,
        additional_price: v.additionalPrice,
        languages: v.langauges || [],
        imageUrl: v.imageUrl,
        selected: selectedVariantsIds.has(v.id),
      })),
    }));

    // Map instructions
    const instructions = cartItem.product.instructions.map(instruction => ({
      ...instruction.toJSON(),
      selected: selectedInstructionsIds.has(instruction.id),
    }));

    // Calculate prices
    const discountedPrice = offer ? this.offerService.getDiscountedPrice(cartItem.product.basePrice, offer) : cartItem.product.basePrice;
    const extrasTotal = cartItem.extras.reduce((sum, extra) => sum + (extra.productExtra?.additionalPrice || 0), 0);
    const variantsTotal = cartItem.variants.reduce((sum, variant) => sum + (variant.productVariant?.additionalPrice || 0), 0);
    const finalPrice = discountedPrice + extrasTotal + variantsTotal;
    const originalPrice = cartItem.product.basePrice + extrasTotal + variantsTotal;
    const totalPrice = finalPrice * cartItem.quantity;

    return {
      cartItemId: cartItem.id,
      quantity: cartItem.quantity,
      note: cartItem.note,
      originalPrice,
      finalPrice,
      totalPrice,
      product: {
        ...cartItem.product.toJSON(),
        discountedPrice,
        images: cartItem.product.images?.map(img => img.imageUrl) || [],
        offer: offer ?? null,
      },
      extras,
      variantCategories,
      instructions,
    };
  }
}