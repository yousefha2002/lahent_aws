import { LoyaltyOffer } from 'src/modules/loyalty_offer/entites/loyalty_offer.entity';
import { Customer } from './../../customer/entities/customer.entity';
import {Table,Column,Model,DataType,AutoIncrement,PrimaryKey,ForeignKey,AllowNull,BelongsTo,Default,} from 'sequelize-typescript';
import { Order } from 'src/modules/order/entities/order.entity';
import { GatewaySource } from 'src/common/enums/gateway-source';
import { GatewayType } from 'src/common/enums/gateway_type';
@Table({ 
    tableName: 'payment_sessions' ,
    indexes:[{ name: 'idx_payment_sessions_paymentOrderId', fields: ['paymentOrderId'] }]
})
export class PaymentSession extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Order)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    orderId: number;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => LoyaltyOffer)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    loyaltyOfferId: number;

    @BelongsTo(() => LoyaltyOffer)
    loyaltyOffer: LoyaltyOffer;

    @ForeignKey(() => Customer)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer,{onDelete: 'SET NULL'})
    customer: Customer;

    @Column(DataType.ENUM(...Object.values(GatewaySource)))
    purpose: GatewaySource;

    @Column(DataType.FLOAT)
    amount: number;

    @Column(DataType.STRING)
    currency:string

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(GatewayType)))
    provider: GatewayType;

    @AllowNull(true)
    @Column(DataType.STRING)
    transactionId: string;

    @Column(DataType.STRING)
    paymentOrderId: string;

    @Column(DataType.STRING)
    hash: string;

    @AllowNull(false)
    @Default('pending')
    @Column(DataType.ENUM('pending', 'success', 'failed'))
    status: 'pending' | 'success' | 'failed';
}