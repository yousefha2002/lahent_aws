import { CouponService } from './../coupon/coupon.service';
import { LoyaltySettingService } from './../loyalty_setting/loyalty_setting.service';
import { ProuductVariantService } from './../prouduct_variant/prouduct_variant.service';
import { OfferService } from './../offer/offer.service';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Cart } from './entities/cart.entity';
import { StoreService } from '../store/services/store.service';
import { StoreStatus } from 'src/common/enums/store_status';
import { CartItemService } from '../cart_item/cart_item.service';
import { ProductService } from '../product/product.service';
import { CreateCartProductDto } from './dto/create-product-cart.dto';
import { CartItemExtraService } from '../cart_item_extra/cart_item_extra.service';
import { Sequelize, Transaction } from 'sequelize';
import { CartItemInstructionService } from '../cart_item_instruction/cart_item_instruction.service';
import { CartItemVariantService } from '../cart_item_variant/cart_item_variant.service';
import { UpdateCartProductQuantityDto } from './dto/update-productCart-quantity';
import { Store } from '../store/entities/store.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { UpdateCartProductDto } from './dto/update-product-cart.dto';
import { round2 } from 'src/common/utils/round2';

@Injectable()
export class CartService {
  constructor(
    @Inject(repositories.cart_repository)
    private cartRepo: typeof Cart,
    private readonly storeService: StoreService,
    private readonly cartItemService: CartItemService,
    private readonly productService: ProductService,
    private readonly cartItemExtraService: CartItemExtraService,
    private readonly cartItemInstructionService: CartItemInstructionService,
    private readonly cartItemVariantService: CartItemVariantService,
    private readonly offerService: OfferService,
    private readonly prouductVariantService: ProuductVariantService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly i18n: I18nService,
    private loyaltySettingService:LoyaltySettingService,
    private readonly couponService:CouponService
  ) {}

  async createProductCart(
    dto: CreateCartProductDto,
    customerId: number,
    lang = Language.ar,
  ) {
    const transaction = await this.sequelize.transaction();
    const product = await this.productService.productById(dto.productId)
    const store = await this.storeService.getStoreById(product.storeId)
    try {
      if (
        store.status === StoreStatus.APPROVED &&
        product.isActive
      ) {
        await this.prouductVariantService.validateProductVariantsSelection(
          dto.productId,
          dto.variants,
        );
        const [cart, isCreated] = await this.findCartOrCreate(
          customerId,
          store.id,
          transaction,
        );
        const cartItem = await this.cartItemService.insertProductinCart(
          cart.id,
          dto.productId,
          dto.quantity,
          transaction,
          dto.note,
        );
        // create extras , instructions , variants
        await Promise.all([
          this.cartItemExtraService.insertExtraItemsForCart(
            dto.extras,
            cartItem.id,
            cartItem.productId,
            transaction,
          ),
          this.cartItemInstructionService.insertInstructionsItemsForCart(
            dto.instructions,
            cartItem.id,
            cartItem.productId,
            transaction,
          ),
          this.cartItemVariantService.insertVariantsItemsForCart(
            dto.variants,
            cartItem.id,
            cartItem.productId,
            transaction,
          ),
        ]);
        await transaction.commit();
        const message = this.i18n.translate('translation.cart_product_added', {
          lang,
        });
        return { message };
      } else {
        const message = this.i18n.translate('translation.invalid_store', {
          lang,
        });
        throw new BadRequestException(message);
      }
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async findCartOrCreate(
    customerId: number,
    storeId: number,
    transaction: Transaction,
  ) {
    const cart = await this.cartRepo.findOrCreate({
      where: { storeId, customerId },
      transaction,
    });
    return cart;
  }

  async deleteProductFromCart(
    cartItemId: number,
    customerId: number,
    lang = Language.en,
  ) {
    const cartItem = await this.cartItemService.findCartItem(cartItemId);
    const cart = await this.cartRepo.findOne({
      where: { id: cartItem.cartId, customerId },
    });
    if (!cart) {
      const message = this.i18n.translate('translation.invalid_cart', { lang });
      throw new BadRequestException(message);
    }
    await cartItem.destroy();
    const message = this.i18n.translate('translation.cart_product_deleted', {
      lang,
    });
    return { message };
  }

  async updateProductQuantity(
    cartItemId: number,
    customerId: number,
    dto: UpdateCartProductQuantityDto,
    lang = Language.en,
  ) {
    const cartItem = await this.cartItemService.findCartItem(cartItemId);
    const cart = await this.cartRepo.findOne({
      where: { id: cartItem.cartId, customerId },
    });
    if (!cart) {
      const message = this.i18n.translate('translation.invalid_cart', { lang });
      throw new BadRequestException(message);
    }
    cartItem.quantity = dto.quantity;
    await cartItem.save();
    const message = this.i18n.translate(
      'translation.cart_product_quantity_updated',
      { lang },
    );
    return { message };
  }

  async getCartItemsWithOffers(storeId: number, customerId: number,lang:Language,couponCode?:string) {
    const cart = await this.cartRepo.findOne({where:{customerId,storeId}});
    if(!cart)
    {
      const message = this.i18n.translate('translation.cart_ownership_error', {lang});
      throw new ForbiddenException(message);
    }

    const cartItems = await this.cartItemService.findAllItemsByCartIdAndCustomerId(cart.id,customerId,lang);

    let totalOriginalPrice = 0;
    let totalFinalPrice = 0;
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = item.product;
        const offer = await this.offerService.getActiveOfferForProduct(
          product.id,
        );

        // حساب سعر المنتج بعد الخصم
        let discountedPrice = product.basePrice;
        if (offer) {
          discountedPrice = this.offerService.getDiscountedPrice(product.basePrice,offer);
        }
        const extrasTotal =item.extras.reduce((sum, e) => sum + (e.productExtra.additionalPrice || 0), 0) |0;
        const variantsTotal =item.variants?.reduce((sum, v) => sum + (v.productVariant.additionalPrice || 0),0,) | 0;
        const originalPrice = product.basePrice + extrasTotal + variantsTotal;
        const finalPrice = discountedPrice + extrasTotal + variantsTotal;
        const totalPrice = finalPrice * item.quantity;
        totalOriginalPrice += originalPrice * item.quantity;
        totalFinalPrice += totalPrice;

        return {
          id: item.id,
          note:item.note,
          quantity: item.quantity,
          finalPrice:round2(finalPrice),
          totalPrice:round2(totalPrice),
          originalPrice:round2(originalPrice),
          product: {
            ...product.toJSON(),
            discountedPrice:round2(discountedPrice),
            images: product.images?.map((img) => img.imageUrl) || [],
            offer: offer ?? null,
          },
          extras: item.extras.map((e) => ({
            ...e.productExtra.toJSON(),
          })),
          variants: item.variants.map((v) => {
          const variant = v.productVariant.toJSON();
          const variantCategory = variant.productCategoryVariant?.variantCategory;

          return {
          id: variant.id,
          additionalPrice: variant.additionalPrice,
          imageUrl: variant.imageUrl,
          isActive: variant.isActive,
          languages: variant.langauges?.map((l: { languageCode: string; name: string }) => ({
            languageCode: l.languageCode,
            name: l.name,
          })) || [],
          variantCategory: variantCategory
            ? {
                id: variantCategory.id,
                languages: variantCategory.languages?.map((l: { languageCode: string; name: string }) => ({
                  languageCode: l.languageCode,
                  name: l.name,
                })) || [],
              }
            : null,
        };
        }),
          instructions: item.instructions.map((i) => ({
            ...i.productInstruction.toJSON(),
          })),
        };
      }),
    );
    const offersDiscount = round2(totalOriginalPrice - totalFinalPrice);
    const loyaltySetting = await this.loyaltySettingService.getSettings();
    let couponDiscountAmount = 0;
    let couponId: number | null = null;
    if (couponCode) {
      const coupon = await this.couponService.validateCoupon(couponCode,customerId, lang);
      couponDiscountAmount = round2((totalFinalPrice * coupon.discountPercentage) / 100);
      couponId = coupon.id;
    }
    totalFinalPrice = round2(totalFinalPrice - couponDiscountAmount);
    const pointsEarned = Math.floor(totalFinalPrice * loyaltySetting.pointsPerCurrency);
    return {
      items,
      totalOriginalPrice:round2(totalOriginalPrice),
      offersDiscount,
      couponDiscountAmount,
      totalFinalPrice,
      pointsEarned,
      estimatedTime :Math.max(...cartItems.map((item) => item.product.preparationTime || 0)),
      couponId,
    }
  }

  async findCartByCustomer(
    cartId: number,
    customerId: number,
    lang = Language.en,
  ) {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId, customerId },
    });
    if (!cart) {
      const message = this.i18n.translate('translation.cart_ownership_error', {
        lang,
      });
      throw new ForbiddenException(message);
    }
    return cart;
  }

  async findAllCartsByCustomer(customerId: number) {
    const carts = await this.cartRepo.findAll({
      where: { customerId },
      include: [
        {
          model: Store,
        },
      ],
    });

    return carts;
  }

  async deleteCart(
    storeId: number,
    customerId: number,
    transaction?: any,
    lang = Language.ar,
  ) {
    await this.cartRepo.destroy({
      where: { storeId, customerId },
      force: true,
      transaction,
    });
    const message = this.i18n.translate('translation.cart_deleted', { lang });
    return { message };
  }

  async deleteAllCartsByStore(storeId: number, transaction?: any) {
    await this.cartRepo.destroy({
      where: { storeId },
      transaction,
    });
  }

  async updateProductCartItem(
    cartItemId: number,
    dto: UpdateCartProductDto,
    customerId: number,
    lang = Language.en,
  ) {
    const transaction = await this.sequelize.transaction();

    try {
      // 1. Fetch cart item with relation to cart and validate ownership
      const cartItem =
        await this.cartItemService.findCartItemWithCustomer(cartItemId);

      if (!cartItem) {
        const message = this.i18n.translate('translation.cart_item_not_found', {
          lang,
        });
        throw new NotFoundException(message);
      }

      const product = await this.productService.productById(cartItem.productId);
      if (!product || !product.isActive) {
        const message = this.i18n.translate('translation.product.invalid', {
          lang,
        });
        throw new BadRequestException(message);
      }

      if (
        cartItem.cart.customerId !== customerId ||
        cartItem.cart.storeId !== product.storeId
      ) {
        const message = this.i18n.translate(
          'translation.cart_ownership_error',
          { lang },
        );
        throw new BadRequestException(message);
      }

      await this.prouductVariantService.validateProductVariantsSelection(
        cartItem.productId,
        dto.variants,
      );

      // 2. Update quantity if changed
      if (dto.quantity && dto.quantity !== cartItem.quantity) {
        cartItem.quantity = dto.quantity;
      }

      if (dto.note) {
        cartItem.note = dto.note;
      }

      await cartItem.save({ transaction });

      // 3. Clear existing extras, instructions, variants for this cartItem
      await Promise.all([
        this.cartItemExtraService.destroyAll(cartItemId, transaction),
        this.cartItemInstructionService.destroyAll(cartItemId, transaction),
        this.cartItemVariantService.destroyAll(cartItemId, transaction),
      ]);

      // 4. Insert new extras, instructions, variants
      await Promise.all([
        this.cartItemExtraService.insertExtraItemsForCart(
          dto.extras,
          cartItemId,
          cartItem.productId,
          transaction,
        ),
        this.cartItemInstructionService.insertInstructionsItemsForCart(
          dto.instructions,
          cartItemId,
          cartItem.productId,
          transaction,
        ),
        this.cartItemVariantService.insertVariantsItemsForCart(
          dto.variants,
          cartItemId,
          cartItem.productId,
          transaction,
        ),
      ]);

      await transaction.commit();
      const message = this.i18n.translate('translation.cart_item_updated', {
        lang,
      });
      return { message };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
