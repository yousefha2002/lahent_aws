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
  ) {}

  async createProductCart(
    dto: CreateCartProductDto,
    customerId: number,
    lang = Language.en,
  ) {
    const transaction = await this.sequelize.transaction();
    const product = await this.productService.productById(dto.productId)
    const store = await this.storeService.storeById(product.storeId)
    try {
      if (
        store &&
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

  async getCartItemsWithOffers(storeId: number, customerId: number,lang:Language) {
    const cart = await this.cartRepo.findOne({where:{customerId,storeId}});
    if(!cart)
    {
      const message = this.i18n.translate('translation.cart_ownership_error', {lang});
      throw new ForbiddenException(message);
    }

    const cartItems =
      await this.cartItemService.findAllItemsByCartIdAndCustomerId(
        cart.id,
        customerId,
        lang
      );

    return Promise.all(
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

        return {
          id: item.id,
          note:item.note,
          quantity: item.quantity,
          finalPrice,
          totalPrice,
          originalPrice,
          product: {
            ...product.toJSON(),
            discountedPrice,
            images: product.images?.map((img) => img.imageUrl) || [],
            offer: offer ?? null,
          },
          extras: item.extras.map((e) => ({
            ...e.productExtra.toJSON(),
          })),
          variants: item.variants.map((v) => ({
            ...v.productVariant.toJSON(),
            languages:v.productVariant.langauges
          })),
          instructions: item.instructions.map((i) => ({
            ...i.productInstruction.toJSON(),
          })),
        };
      }),
    );
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
    lang = Language.en,
  ) {
    await this.cartRepo.destroy({
      where: { storeId, customerId },
      transaction,
    });
    const message = this.i18n.translate('translation.cart_deleted', { lang });
    return { message };
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
