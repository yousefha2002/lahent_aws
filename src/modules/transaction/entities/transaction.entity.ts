import { AutoIncrement, PrimaryKey, Table,Model, DataType, Column, ForeignKey, BelongsTo, AllowNull } from "sequelize-typescript";
import { TransactionType } from "src/common/enums/transaction_type";
import { Customer } from "src/modules/customer/entities/customer.entity";
import { Gift } from "src/modules/gift/entities/gift.entity";
import { LoyaltyOffer } from "src/modules/loyalty_offer/entites/loyalty_offer.entity";
import { Order } from "src/modules/order/entities/order.entity";

@Table({ 
    tableName: 'transactions',
    indexes: [
        { name: 'idx_transaction_customerId', fields: ['customerId'] },
        { name: 'idx_transaction_type', fields: ['type'] },
        { name: 'idx_transaction_createdAt', fields: ['createdAt'] },
        { name: 'idx_transaction_customerId_createdAt', fields: ['customerId', 'createdAt'] },
        { name: 'idx_transaction_customerId_type', fields: ['customerId', 'type'] },
        { name: 'idx_transaction_orderId', fields: ['orderId'] },
        { name: 'idx_transaction_giftId', fields: ['giftId'] },
        { name: 'idx_transaction_loyaltyOfferId', fields: ['loyaltyOfferId'] },
    ]
})
export class Transaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Customer)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer,{onDelete: 'SET NULL'})
    customer: Customer;

    @Column(DataType.FLOAT)
    amount: number;

    @Column(DataType.ENUM('IN', 'OUT'))
    direction: 'IN' | 'OUT';

    @Column(DataType.ENUM(...Object.values(TransactionType)))
    type: TransactionType;

    @ForeignKey(() => Order)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    orderId?: number;

    @BelongsTo(() => Order)
    order?: Order;

    // 🔗 ربط بـ Gift (لو العملية من أجل إرسال/استلام هدية)
    @ForeignKey(() => Gift)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    giftId?: number;

    @BelongsTo(() => Gift)
    gift?: Gift;

    // 🔗 ربط بـ LoyaltyOffer (لو العملية من عرض شحن رصيد)
    @ForeignKey(() => LoyaltyOffer)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    loyaltyOfferId?: number;

    @BelongsTo(() => LoyaltyOffer)
    loyaltyOffer?: LoyaltyOffer;
}