import { LoyaltySettingService } from './../../loyalty_setting/loyalty_setting.service';
import { StoreUtilsService } from './../../store/services/storeUtils.service';
import { StoreService } from 'src/modules/store/services/store.service';
import { CarService } from '../../car/car.service';
import { OrderItemVariantService } from '../../order_item_variant/order_item_variant.service';
import { OrderItemInstructionService } from '../../order_item_instruction/order_item_instruction.service';
import { OrderItemExtraService } from '../../order_item_extra/order_item_extra.service';
import { OrderItemService } from '../../order_item/order_item.service';
import { CouponService } from '../../coupon/coupon.service';
import { CartService } from '../../cart/cart.service';
import {BadRequestException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { createOrderDto } from '../dto/create-order.dto';
import { OrderStatus } from 'src/common/enums/order_status';
import { PickupType } from 'src/common/enums/pickedup_type';
import { PaymentMethod } from 'src/common/enums/payment_method';
import {MIN_POINTS_TO_USE} from 'src/common/constants';
import { Customer } from '../../customer/entities/customer.entity';
import { round2 } from 'src/common/utils/round2';
import { Sequelize } from 'sequelize';
import { Coupon } from '../../coupon/entities/coupon.entity';
import { StoreStatus } from 'src/common/enums/store_status';
import { Op } from 'sequelize';
import { filterStatusByStore } from 'src/common/types/filter-status';
import { Avatar } from 'src/modules/avatar/entities/avatar.entity';
import { Car } from 'src/modules/car/entities/car.entity';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';
import { OrderItemExtra } from 'src/modules/order_item_extra/entities/order_item_extra.entity';
import { OrderItemVariant } from 'src/modules/order_item_variant/entities/order_item_variant.entity';
import { OrderItemInstruction } from 'src/modules/order_item_instruction/entities/order_item_instruction.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductImage } from 'src/modules/product_image/entities/product_image.entity';
import { Store } from 'src/modules/store/entities/store.entity';
import { OpeningHour } from 'src/modules/opening_hour/entites/opening_hour.entity';
import { I18nService } from 'nestjs-i18n';
import { Language } from 'src/common/enums/language';
import { StoreLanguage } from 'src/modules/store/entities/store_language.entity';
import { CarBrand } from 'src/modules/car_brand/entities/car_brand.entity';
import { CarBrandLanguage } from 'src/modules/car_brand/entities/car_brand.languae.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject(repositories.order_repository) private orderRepo: typeof Order,
    private readonly cartService: CartService,
    private readonly couponService: CouponService,
    private readonly orderItemExtraService: OrderItemExtraService,
    private readonly orderItemInstructionService: OrderItemInstructionService,
    private readonly orderItemVariantService: OrderItemVariantService,
    private readonly orderItemService: OrderItemService,
    private readonly carService: CarService,
    private readonly storeService: StoreService,
    private readonly storeUtilsService: StoreUtilsService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly i18n: I18nService,
    private loyaltySettingService:LoyaltySettingService
  ) {}

  async placeOrder(user: Customer, dto: createOrderDto, lang = Language.en) {
        const transaction = await this.sequelize.transaction();
        try {
            const {
                storeId,
                couponCode,
                scheduledAt,
                pickupType,
                pickupByCustomer,
                pickupPersonName,
                pickupPersonNumber,
                carId,
                pointsUsed,
                paymentMethod,
                gatewayType,
            } = dto;

      const pointsUsedSafe = pointsUsed ?? 0;
      const store = await this.storeService.storeById(storeId);
      if (!store || store.status !== StoreStatus.APPROVED || !store.isOnline) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.store_unavailable', { lang }),
        );
      }
      if (pickupType === PickupType.DRIVE_THRU && !store.driveThru) {
        throw new BadRequestException(
            this.i18n.translate('translation.orders.store_no_drive_thru', { lang }),
        );
    }

      if (pickupType === PickupType.IN_STORE && !store.inStore) {
          throw new BadRequestException(
              this.i18n.translate('translation.orders.store_no_in_store', { lang }),
          );
      }

      if (pointsUsedSafe > 0 && user.points < MIN_POINTS_TO_USE) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.min_points_required', {
            lang,
          }),
        );
      }

      if (pointsUsedSafe > 0 && pointsUsedSafe > user.points) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.points_exceed_balance', {
            lang,
          }),
        );
      }

      if (scheduledAt && new Date(scheduledAt) <= new Date()) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.scheduled_in_past', { lang }),
        );
      }

      if (pickupByCustomer === undefined || pickupByCustomer === null) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.pickup_required', { lang }),
        );
      }

      if (
        pickupByCustomer === true &&
        (pickupPersonName || pickupPersonNumber)
      ) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.pickup_self_no_other', {
            lang,
          }),
        );
      } else if (
        !pickupByCustomer &&
        (!pickupPersonName || !pickupPersonNumber)
      ) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.pickup_person_required', {
            lang,
          }),
        );
      }

      let finalCarId: number | null = null;
      if (pickupType === PickupType.DRIVE_THRU) {
        finalCarId = carId ?? null;
        if (!finalCarId && dto.newCar) {
          const car = await this.carService.create(
            user.id,
            dto.newCar,
            lang,
            transaction,
          );
          finalCarId = car.carId;
        } else if (finalCarId) {
          await this.carService.getCustomerCar(user.id, finalCarId, lang);
        }
        if (!finalCarId) {
          throw new BadRequestException(
            this.i18n.translate('translation.orders.car_required', { lang }),
          );
        }
      }

      const cartItems = await this.cartService.getCartItemsWithOffers(storeId,user.id,lang);

      const estimatedTime = Math.max(
        ...cartItems.map((item) => item.product.preparationTime || 0),
      );

      if (scheduledAt) {
        const storeIsOpen = await this.storeService.isStoreOpenAt(
          storeId,
          scheduledAt,
        );
        if (!storeIsOpen) {
          throw new BadRequestException(
            this.i18n.translate('translation.orders.store_closed_scheduled', {
              lang,
            }),
          );
        }
      } else {
        const now = new Date();
        const storeIsOpenNow = await this.storeService.isStoreOpenAt(
          storeId,
          now,
        );
        if (!storeIsOpenNow) {
          throw new BadRequestException(
            this.i18n.translate('translation.orders.store_closed_now', {
              lang,
            }),
          );
        }
      }

      const subtotalBeforeDiscount = round2(cartItems.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0),);

      let coupon: Coupon | null = null;
      if (couponCode) {
        coupon = await this.couponService.validateCoupon(
          couponCode,
          lang,
        );
      }

      const loyaltySetting = await this.loyaltySettingService.getSettings();
      const discountCouponAmount = coupon? round2(subtotalBeforeDiscount * (coupon.discountPercentage / 100)): 0;
      const finalPriceToPay = round2(subtotalBeforeDiscount - discountCouponAmount);
      // change to use from loyalty setting table
      const pointsAmountUsed = round2(pointsUsedSafe * loyaltySetting.dollarPerPoint);

      if (pointsAmountUsed > finalPriceToPay) {
        throw new BadRequestException(
          this.i18n.translate('translation.orders.points_greater_than_total', {
            lang,
          }),
        );
      }

      let remainingAmount = round2(finalPriceToPay - pointsAmountUsed);
      if (isNaN(remainingAmount) || remainingAmount < 0) {
        remainingAmount = 0;
      }

      // change to use from loyalty setting table
      const pointsEarned = Math.floor(remainingAmount * loyaltySetting.pointsPerDollar);

      let walletAmountUsed = 0;
      let gatewayAmountUsed = 0;

      if (remainingAmount > 0) {
        if (paymentMethod === PaymentMethod.WALLET) {
          if (remainingAmount > user.walletBalance) {
            throw new BadRequestException(
              this.i18n.translate('translation.orders.wallet_insufficient', {
                lang,
              }),
            );
          }
          walletAmountUsed = round2(remainingAmount);
        } else if (paymentMethod === PaymentMethod.GATEWAY) {
          gatewayAmountUsed = round2(remainingAmount);
        } else {
          throw new BadRequestException(
            this.i18n.translate('translation.orders.invalid_payment_method', {
              lang,
            }),
          );
        }
      }

      const order = await this.orderRepo.create(
        {
          customerId: user.id,
          storeId:storeId,
          subtotalBeforeDiscount,
          estimatedTime,
          discountCouponAmount,
          finalPriceToPay,
          couponId: coupon ? coupon.id : null,
          status: OrderStatus.PENDING_PAYMENT,
          isPaid: false,
          pickupType,
          scheduledAt: scheduledAt || null,
          isScheduled: !!scheduledAt,
          pickupByCustomer: pickupByCustomer,
          pickupPersonName:
            pickupByCustomer === false ? pickupPersonName : null,
          pickupPersonNumber:
            pickupByCustomer === false ? pickupPersonNumber : null,
          walletAmountUsed,
          gatewayAmountUsed,
          paymentGateway: gatewayType || null,
          paymentMethod,
          pointsAmountUsed: pointsAmountUsed || 0,
          pointsRedeemed: pointsUsedSafe || 0,
          pointsEarned: pointsEarned || 0,
          carId: pickupType === PickupType.DRIVE_THRU ? finalCarId : null,
        },
        { transaction },
      );

      for (const item of cartItems) {
        const productName = item.product.languages?.find(l => l.languageCode === lang)?.name ?? item.product.languages?.[0]?.name ?? '';
        const extrasForDb = item.extras.map(e => ({...e,name: e.languages?.find(l => l.languageCode === lang)?.name ?? e.languages?.[0]?.name ?? '',}));
        const instructionsForDb = item.instructions.map(i => ({...i,name: i.languages?.find(l => l.languageCode === lang)?.name ?? i.languages?.[0]?.name ?? ''}));
        const variantsForDb = item.variants.map(v => ({...v,name: v.languages?.find(l => l.languageCode === lang)?.name ?? v.languages?.[0]?.name ?? '',}));
        const orderItem = await this.orderItemService.createOrderItem(
          {
            orderId: order.id,
            productId: item.product.id,
            productName: productName,
            productImageUrl: item.product.images[0],
            unitBasePrice: item.product.basePrice,
            unitDiscountedPrice:item.product.discountedPrice,
            unitFinalPrice:item.finalPrice,
            finalSubtotal:round2(item.finalPrice * item.quantity),
            quantity: item.quantity,
            offerId: item.product.offer?.id ?? null,
            freeQty: 0,
            note:item.note,
          },
          transaction,
        );
        await Promise.all([
          this.orderItemExtraService.createExtras(orderItem.id, extrasForDb, transaction),
          this.orderItemVariantService.createVariants(orderItem.id, variantsForDb, transaction),
          this.orderItemInstructionService.createInstructions(orderItem.id,instructionsForDb,transaction),
          ]);
        }

      await this.cartService.deleteCart(storeId, user.id, transaction);

      await transaction.commit();
      return {
        orderId: order.id,
        totalPrice: round2(finalPriceToPay),
        message: this.i18n.translate('translation.orders.order_placed_successfully', { lang }),
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOrdersByStore(
    storeId: number,
    page = 1,
    limit = 10,
    filterStatus?: filterStatusByStore,
  ) {
    const offset = (page - 1) * limit;
    const statusMap: Record<string, OrderStatus[]> = {
      incoming: [
        OrderStatus.PLACED,
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.CUSTOMER_DECISION,
      ],
      preparing: [OrderStatus.PREPARING, OrderStatus.HALF_PREPARATION],
      ready: [OrderStatus.READY],
      arrived: [OrderStatus.ARRIVED],
      completed: [OrderStatus.RECEIVED],
      cancelled: [
        OrderStatus.REJECTED,
        OrderStatus.CANCELLED,
        OrderStatus.EXPIRED,
      ],
      completedOrCanceled: [
        OrderStatus.RECEIVED,
        OrderStatus.REJECTED,
        OrderStatus.CANCELLED,
        OrderStatus.EXPIRED,
    ]
    };

    const whereClause: any = { storeId };
    if (filterStatus && statusMap[filterStatus]) {
      whereClause.status = { [Op.in]: statusMap[filterStatus] };
    } else {
      whereClause.status = { [Op.ne]: OrderStatus.PENDING_PAYMENT };
    }

    const { rows: orders, count } = await this.orderRepo.findAndCountAll({
      where: whereClause,
      include: [{ model: Customer, include: [{ model: Avatar }] }],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM order_items AS oi 
                            WHERE oi.orderId = Order.id
                        )`),
            'productCount',
          ],
        ],
      },
      offset,
      limit,
      subQuery: false,
      order: [
        [Sequelize.cast(Sequelize.col('orderNumber'), 'UNSIGNED'), 'DESC'],
      ],
    });

    const ordersJson = orders.map((order) => order.toJSON());
    const totalItems = Array.isArray(count) ? count.length : count;

    return {
      orders: ordersJson,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getOrdersForCustomer(
    customerId: number,
    page = 1,
    limit = 10,
    lang = Language.en,
    storeId?:number
  ) {
    const offset = (page - 1) * limit;
    const where: any = { customerId };
    if (storeId) {
      where.storeId = storeId; // إضافة شرط على storeId إذا وُجد
    }
    const { rows: orders, count } = await this.orderRepo.findAndCountAll({
      where,
      include: [{ model: Store,include:[{model:StoreLanguage,required:false,where:{languageCode:lang}}]}],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
                            SELECT COUNT(*) 
                            FROM order_items AS oi 
                            WHERE oi.orderId = Order.id
                        )`),
            'productCount',
          ],
        ],
      },
      offset,
      limit,
      subQuery: false,
      order: [['createdAt', 'DESC']],
    });
    const ordersJson = orders.map((order) => order.toJSON());
    const totalItems = Array.isArray(count) ? count.length : count;
    return {
      orders: ordersJson,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getOrderByStore(storeId: number, orderId: number, lang = Language.en) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId },
      include: [
        { model: Customer, include: [Avatar] },
        { model: Car, include: [
          {model:CarBrand,include:[{model:CarBrandLanguage,where:{languageCode:lang}}]},
        ] 
        },
        {
          model: OrderItem,
          include: [
            OrderItemExtra,
            OrderItemVariant,
            OrderItemInstruction,
            { model: Product, include: [ProductImage] },
          ],
        },
      ],
    });
    if (!order) {
      throw new NotFoundException(
        this.i18n.translate('translation.orders.not_found', { lang }),
      );
    }
    return order;
  }

  async getOrderByCustomer(
    customerId: number,
    orderId: number,
    lang = Language.en,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, customerId },
      include: [
        { model: Store, include: [{ model: OpeningHour},{model:StoreLanguage,required:false,where:{languageCode:lang}}] },
        { model: Car, include: [
          {model:CarBrand,include:[{model:CarBrandLanguage,where:{languageCode:lang}}]},
        ] 
        },
        {
          model: OrderItem,
          include: [
            OrderItemExtra,
            OrderItemVariant,
            OrderItemInstruction,
            { model: Product, include: [ProductImage] },
          ],
        },
      ],
    });
    if (!order) {
      throw new NotFoundException(
        this.i18n.translate('translation.orders.not_found', { lang }),
      );
    }
    const storeHours = order.store
      ? this.storeUtilsService.getStoreTodayHours(order.store)
      : { openTime: null, closeTime: null };

    return {
      ...order.toJSON(),
      store: {
        ...order.store?.toJSON(),
        ...storeHours,
        averageRating:
          order.store.numberOfRates > 0
            ? order.store.rate / order.store.numberOfRates
            : 0,
      },
    };
  }

  async generateOrderNumber(storeId: number, transaction?: any) {
    const result = await this.orderRepo.findOne({
      where: { storeId },
      attributes: [
        [Sequelize.fn('MAX', Sequelize.col('orderNumber')), 'maxOrderNumber'],
      ],
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });

    const maxOrderNumber = result?.getDataValue('maxOrderNumber') ?? 0;
    return +maxOrderNumber + 1;
  }

  async countRecivedOrderForCustomer(
    orderId: number,
    customerId: number,
    storeId: number,
  ) {
    const count = await this.orderRepo.count({
      where: { id: orderId, customerId, storeId, status: OrderStatus.RECEIVED },
    });
    return count;
  }
}
