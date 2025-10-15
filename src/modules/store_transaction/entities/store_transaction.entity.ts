import { Table, Column, Model, DataType, ForeignKey, BelongsTo, Default, AllowNull } from 'sequelize-typescript';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { Order } from 'src/modules/order/entities/order.entity';
import { Store } from 'src/modules/store/entities/store.entity';
@Table({ 
    tableName: 'store_transactions',
    indexes:[
        { name: 'idx_storeTransaction_storeId', fields: ['storeId'] },
        { name: 'idx_storeTransaction_orderId', fields: ['orderId'] },
        { name: 'idx_storeTransaction_status', fields: ['status'] },
        { name: 'idx_storeTransaction_createdAt', fields: ['createdAt'] },
        { name: 'idx_storeTransaction_storeId_createdAt', fields: ['storeId', 'createdAt'] },
        { name: 'idx_storeTransaction_storeId_status', fields: ['storeId', 'status'] }
    ]
})
export class StoreTransaction extends Model {
    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store,{onDelete: 'SET NULL'})
    store: Store;

    @AllowNull(true)
    @ForeignKey(() => Order)
    @Column(DataType.INTEGER)
    orderId: number;

    @BelongsTo(() => Order,{onDelete: 'SET NULL'})
    order: Order;

    @Column(DataType.FLOAT)
    totalAmount: number; // سعر الطلب كامل

    @Column(DataType.FLOAT)
    commissionPercent: number; // النسبة التي تم تطبيقها وقت الطلب

    @Column(DataType.FLOAT)
    commissionAmount: number; // العمولة المحسوبة

    @Column(DataType.FLOAT)
    storeRevenue: number; // المبلغ الذي يذهب للستور بعد خصم العمولة

    @Default(StoreTransactionType.COMPLETED)
    @Column(DataType.ENUM(...Object.values(StoreTransactionType)))
    status: StoreTransactionType;

    @Column({type: DataType.TEXT,allowNull: true,})
    note: string;

    @Column({type: DataType.STRING,allowNull: true})
    receipt: string;
}