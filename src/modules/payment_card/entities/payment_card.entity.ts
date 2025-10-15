import {Table,Column,Model,DataType,PrimaryKey,AutoIncrement,Default,AllowNull, BelongsTo, ForeignKey} from 'sequelize-typescript';
import { Customer } from 'src/modules/customer/entities/customer.entity';

@Table({ 
    tableName: 'payment_cards',
    indexes:[
        { name: 'idx_payment_cards_customer', fields: ['customerId'] },
        { name: 'idx_payment_cards_customer_isDefault', fields: ['customerId', 'isDefault'] }
    ]
})
export class PaymentCard extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column({ type: DataType.STRING(16)})
    cardNumber: string;

    @AllowNull(false)
    @Column({ type: DataType.STRING(7) })
    expiryDate: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    cardHolderName: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    cardName: string;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isDefault: boolean;

    @ForeignKey(() => Customer,)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer,{onDelete: 'CASCADE'})
    customer: Customer;
}