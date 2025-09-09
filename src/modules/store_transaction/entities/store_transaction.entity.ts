import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Order } from 'src/modules/order/entities/order.entity';
import { Store } from 'src/modules/store/entities/store.entity';
@Table({ tableName: 'store_transactions' })
export class StoreTransaction extends Model {
    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store)
    store: Store;

    @ForeignKey(() => Order)
    @Column(DataType.INTEGER)
    orderId: number;

    @BelongsTo(() => Order)
    order: Order;

    @Column(DataType.FLOAT)
    totalAmount: number; // سعر الطلب كامل

    @Column(DataType.FLOAT)
    commissionPercent: number; // النسبة التي تم تطبيقها وقت الطلب

    @Column(DataType.FLOAT)
    commissionAmount: number; // العمولة المحسوبة

    @Column(DataType.FLOAT)
    storeRevenue: number; // المبلغ الذي يذهب للستور بعد خصم العمولة
}