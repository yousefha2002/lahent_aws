import { StoreUtilsService } from './../../store/services/storeUtils.service';
import {Inject,Injectable,NotFoundException} from '@nestjs/common';
import { repositories } from 'src/common/enums/repositories';
import { Order } from '../entities/order.entity';
import { OrderStatus } from 'src/common/enums/order_status';
import { Customer } from '../../customer/entities/customer.entity';
import { literal, QueryTypes, Sequelize } from 'sequelize';
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
import { getDateRange } from 'src/common/utils/getDateRange';

@Injectable()
export class OrderService {
  constructor(
    @Inject(repositories.order_repository) private orderRepo: typeof Order,
    private readonly storeUtilsService: StoreUtilsService,
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly i18n: I18nService,
    ) {}
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
    ],
    Tracking :[
      OrderStatus.ARRIVED,
      OrderStatus.HALF_PREPARATION,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.SCHEDULED
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

  async countOrdersForCustomer(customerId: number, storeId?: number) 
  {
    const where: any = { customerId };

    if (storeId) {
      where.storeId = storeId;
    }

    const count = await this.orderRepo.count({ where });

    return count;
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
            CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END
          )
        `), 'scheduledCount'],
      ],
      where: {
        storeId,
        createdAt: { [Op.between]: [start, end] }
      },
      raw: true,
    }) as unknown as {
      completedCount: string | number;
      cancelledCount: string | number;
      scheduledCount: string | number;
    };

    return {
      completedCount: Number(result?.completedCount) || 0,
      cancelledCount: Number(result?.cancelledCount) || 0,
      scheduledCount: Number(result?.scheduledCount) || 0,
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
  const { start, end } = getDateRange(filter ?? 'all', specificDate);

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
      replacements: { storeId, start, end },
    }
  );

  const customerRepeatRate = Number(repeatResult[0]?.repeat_rate ?? 0) * 100;

  return { averagePrepTime, customerRepeatRate };
  }

  async hasUsedCouponBefore(customerId: number, couponId: number): Promise<boolean> 
  {
    const existingOrder = await this.orderRepo.findOne({
      where: {
        customerId,
        couponId,
        status: {
          [Op.notIn]: [
            OrderStatus.CANCELLED,
            OrderStatus.REJECTED,
            OrderStatus.EXPIRED_PAYMENT,
            OrderStatus.EXPIRED_CONFIRMATION,
          ]
        }
      }
    });

    return !!existingOrder;
  }
}