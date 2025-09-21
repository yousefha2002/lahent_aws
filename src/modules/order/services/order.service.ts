import { LoyaltySettingService } from './../../loyalty_setting/loyalty_setting.service';
import { StoreUtilsService } from './../../store/services/storeUtils.service';
import { StoreService } from 'src/modules/store/services/store.service';
import { CarService } from '../../car/car.service';
import { OrderItemVariantService } from '../../order_item_variant/order_item_variant.service';
import { OrderItemInstructionService } from '../../order_item_instruction/order_item_instruction.service';
import { OrderItemExtraService } from '../../order_item_extra/order_item_extra.service';
import { OrderItemService } from '../../order_item/order_item.service';
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
import { literal, QueryTypes, Sequelize } from 'sequelize';
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
import { OfferType } from 'src/common/enums/offer_type';
import { getDateRange } from 'src/common/utils/getDateRange';

@Injectable()
export class OrderService {
  constructor(
    @Inject(repositories.order_repository) private orderRepo: typeof Order,
    private readonly cartService: CartService,
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
        const {storeId,couponCode,scheduledAt,pickupType,pickupByCustomer,pickupPersonName,pickupPersonNumber,carId,pointsUsed,paymentMethod,gatewayType,} = dto;

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

        const cart = await this.cartService.getCartItemsWithOffers(storeId,user.id,lang,couponCode);
        const {items,estimatedTime} = cart

        if (scheduledAt) {
          const storeIsOpen = await this.storeUtilsService.isStoreOpenAt(
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
          const storeIsOpenNow = await this.storeUtilsService.isStoreOpenAt(
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

        const loyaltySetting = await this.loyaltySettingService.getSettings();
        // change to use from loyalty setting table
        const pointsAmountUsed = round2(pointsUsedSafe * loyaltySetting.dollarPerPoint);

        if (pointsAmountUsed > cart.totalFinalPrice) {
          throw new BadRequestException(
            this.i18n.translate('translation.orders.points_greater_than_total', {
              lang,
            }),
          );
        }

        let remainingAmount = round2(cart.totalFinalPrice - pointsAmountUsed);
        if (isNaN(remainingAmount) || remainingAmount < 0) {
          remainingAmount = 0;
        }

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
            subtotalBeforeDiscount:cart.totalFinalPrice-cart.couponDiscountAmount,
            estimatedTime,
            discountCouponAmount:cart.couponDiscountAmount,
            finalPriceToPay:cart.totalFinalPrice,
            couponId: cart.couponId,
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
            pointsEarned: cart.pointsEarned || 0,
            carId: pickupType === PickupType.DRIVE_THRU ? finalCarId : null,
          },
          { transaction },
        );

        for (const item of items) {
          const productName = item.product.languages?.find(l => l.languageCode === lang)?.name ?? item.product.languages?.[0]?.name ?? '';
          const extrasForDb = item.extras.map(e => ({...e,name: e.languages?.find(l => l.languageCode === lang)?.name ?? e.languages?.[0]?.name ?? '',}));
          const instructionsForDb = item.instructions.map(i => ({...i,name: i.languages?.find(l => l.languageCode === lang)?.name ?? i.languages?.[0]?.name ?? ''}));
          const variantsForDb = item.variants.map(v => ({
            ...v,
            name: v.languages?.find(l => l.languageCode === lang)?.name
                  ?? v.languages?.[0]?.name ?? '',
            category: v.variantCategory?.languages?.find(l => l.languageCode === lang)?.name
                    ?? v.variantCategory?.languages?.[0]?.name ?? '',
          }));
          let freeQty = 0 ;
          if(item.product.offer && item.product.offer.type===OfferType.INCENTIVE)
          {
            freeQty = Math.floor(item.quantity*(item.product.offer.getFreeQty/item.product.offer.buyQty))
          }
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
              freeQty,
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
          totalPrice: round2(cart.totalFinalPrice),
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
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.CUSTOMER_DECISION,
      ],
      scheduled:[
        OrderStatus.SCHEDULED
      ],
      preparing: [OrderStatus.PREPARING, OrderStatus.HALF_PREPARATION],
      ready: [OrderStatus.READY],
      arrived: [OrderStatus.ARRIVED],
      completed: [OrderStatus.RECEIVED],
      cancelled: [
        OrderStatus.REJECTED,
        OrderStatus.CANCELLED,
        OrderStatus.EXPIRED_CONFIRMATION,
      ],
      completedOrCanceled: [
        OrderStatus.RECEIVED,
        OrderStatus.REJECTED,
        OrderStatus.CANCELLED,
        OrderStatus.EXPIRED_CONFIRMATION,
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

  async getStoreOrderStats(storeId: number, filter?: string, specificDate?: string) 
  {
    const { start, end } = getDateRange(filter || 'all', specificDate);
    const result = await Order.findOne({
      attributes: [
        [literal(`
          SUM(
            CASE WHEN status = 'received' THEN 1 ELSE 0 END
          )
        `), 'completedCount'],

        [literal(`
          SUM(
            CASE WHEN status IN ('rejected','cancelled','expired_confirmation') THEN 1 ELSE 0 END
          )
        `), 'cancelledCount'],

        [literal(`
          SUM(
            CASE WHEN status IN ('preparing','half_preparation') THEN 1 ELSE 0 END
          )
        `), 'preparingCount'],
      ],
      where: {
        storeId,
        createdAt: { [Op.between]: [start, end] }, // <-- إضافة شرط التاريخ
      },
      raw: true,
    }) as unknown as {
      completedCount: string | number;
      cancelledCount: string | number;
      preparingCount: string | number;
    };

    return {
      completedCount: Number(result?.completedCount) || 0,
      cancelledCount: Number(result?.cancelledCount) || 0,
      preparingCount: Number(result?.preparingCount) || 0,
    };
  }

  async findOrder(orderId:number,customerId:number)
  {
    const order = await this.orderRepo.findOne({where:{id:orderId,customerId}})
    if(!order)
    {
      throw new NotFoundException('order is not found')
    }
    return order
  }

  async getOrderAvgAnalyticsByStore(
  storeId: number,
  filter?: string,
  specificDate?: string,
) {
  // 1. احصل على نطاق التاريخ من الدالة getDateRange
  const { start, end } = getDateRange(filter ?? 'all', specificDate);

  // 2. متوسط وقت التحضير
  const avgPrepResult = await this.orderRepo.findOne({
    attributes: [
      [this.sequelize.fn('AVG', this.sequelize.col('estimatedTime')), 'averagePrepTime'],
    ],
    where: {
      storeId,
      createdAt: { [Op.between]: [start, end] },
    },
    raw: true,
  }) as unknown as { averagePrepTime: string };

  const averagePrepTime = Number(avgPrepResult?.averagePrepTime ?? 0);

  // 3. نسبة العملاء العائدين
  const repeatResult: any = await this.sequelize.query(
    `
    SELECT 
      COUNT(DISTINCT CASE WHEN order_count > 1 THEN customerId END) * 1.0 
      / NULLIF(COUNT(DISTINCT customerId), 0) AS repeat_rate
    FROM (
      SELECT customerId, COUNT(*) AS order_count
      FROM orders
      WHERE customerId IS NOT NULL 
        AND storeId = :storeId
        AND createdAt BETWEEN :start AND :end
      GROUP BY customerId
    ) sub
    `,
    {
      type: QueryTypes.SELECT,
      replacements: { storeId, start, end }, // 👈 تمرير القيم ضروري
    }
  );

  const customerRepeatRate = Number(repeatResult[0]?.repeat_rate ?? 0) * 100;

  return { averagePrepTime, customerRepeatRate };
  }
}