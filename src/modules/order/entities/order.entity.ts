import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  ForeignKey,
  AllowNull,
  BelongsTo,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { GatewayType } from 'src/common/enums/gateway_type';
import { OrderStatus } from 'src/common/enums/order_status';
import { PaymentMethod } from 'src/common/enums/payment_method';
import { PickupType } from 'src/common/enums/pickedup_type';
import { Car } from 'src/modules/car/entities/car.entity';
import { Coupon } from 'src/modules/coupon/entities/coupon.entity';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'orders' })
export class Order extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Customer)
  @Column(DataType.INTEGER)
  customerId: number;

  @BelongsTo(() => Customer,{onDelete: 'SET NULL'})
  customer: Customer;

  @ForeignKey(() => Coupon)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  couponId: number;

  @BelongsTo(() => Coupon)
  coupon: Coupon;

  @ForeignKey(() => Store)
  @Column(DataType.INTEGER)
  storeId: number;

  @BelongsTo(() => Store,{onDelete: 'SET NULL'})
  store: Store;

  @ForeignKey(() => Car)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  carId: number;

  @BelongsTo(() => Car)
  car: Car;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  subtotalBeforeDiscount: number;

  @AllowNull(true)
  @Column(DataType.FLOAT)
  discountCouponAmount: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  finalPriceToPay: number;

  @AllowNull(false)
  @Default(OrderStatus.PENDING_PAYMENT)
  @Column(DataType.ENUM(...Object.values(OrderStatus)))
  status: OrderStatus;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isPaid: boolean;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  estimatedTime: number; // in minutes

  @AllowNull(true)
  @Column(DataType.DATE)
  confirmationTimeoutAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  placedAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  preparedAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  readyAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  arrivedAt: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  receivedAt: Date;

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];

  @AllowNull(false)
  @Default(PickupType.DRIVE_THRU)
  @Column(DataType.ENUM(...Object.values(PickupType)))
  pickupType: PickupType;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  isScheduled: boolean; // هل هو طلب مجدول؟

  @AllowNull(true)
  @Column(DataType.DATE)
  scheduledAt: Date; // متى يريد الزبون الاستلام؟

  @AllowNull(true)
  @Column(DataType.DATE)
  paidAt: Date; // متى تم الدفع ؟

  @Default(true)
  @Column(DataType.BOOLEAN)
  pickupByCustomer: boolean; // هل الزبون هو المستلم؟ (true = الزبون، false = شخص آخر)

  @AllowNull(true)
  @Column(DataType.STRING)
  pickupPersonName: string; // إذا شخص آخر، يتم تعبئة الاسم

  @AllowNull(true)
  @Column(DataType.STRING)
  pickupPersonNumber: string; // إذا شخص آخر، يتم تعبئة الاسم

  @AllowNull(true)
  @Column(DataType.INTEGER)
  pointsEarned: number;

  @Default(0)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  pointsRedeemed: number;

  @Default(0)
  @Column(DataType.FLOAT)
  walletAmountUsed: number;

  @Default(0)
  @Column(DataType.FLOAT)
  pointsAmountUsed: number; // القيمة النقدية المكافئة للنقاط

  @Default(0)
  @Column(DataType.FLOAT)
  gatewayAmountUsed: number;

  @AllowNull(true)
  @Column(DataType.ENUM(...Object.values(GatewayType)))
  paymentGateway: GatewayType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(PaymentMethod)))
  paymentMethod: PaymentMethod;

  @AllowNull(true)
  @Column({ type: DataType.INTEGER })
  orderNumber: number;

  @AllowNull(true)
  @Column(DataType.DATE)
  canceledAt: Date;

  @HasMany(() => Review)
  reviews: Review[];

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  hasExtended: boolean;
}
