import {
    Table,
    Column,
    Model,
    DataType,
    AutoIncrement,
    PrimaryKey,
    AllowNull,
    ForeignKey,
    BelongsTo,
    HasMany,
    Default,
} from 'sequelize-typescript';
import { Offer } from 'src/modules/offer/entities/offer.entity';
import { Order } from 'src/modules/order/entities/order.entity';
import { OrderItemExtra } from 'src/modules/order_item_extra/entities/order_item_extra.entity';
import { OrderItemInstruction } from 'src/modules/order_item_instruction/entities/order_item_instruction.entity';
import { OrderItemVariant } from 'src/modules/order_item_variant/entities/order_item_variant.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Table({ tableName: 'order_items',indexes:[{ name: 'idx_order_items_orderId', fields: ['orderId'] },]})
    export class OrderItem extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Order)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    orderId: number;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => Offer)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    offerId: number;

    @BelongsTo(() => Offer)
    offer: Offer;

    @ForeignKey(() => Product)
    @Column(DataType.INTEGER)
    productId: number;
    
    @BelongsTo(() => Product,{onDelete: 'SET NULL'})
    product: Product;

    @AllowNull(false)
    @Column(DataType.STRING)
    productName: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    productImageUrl: string;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    unitBasePrice: number;  // السعر الأساسي للمنتج بدون أي إضافات

    @AllowNull(false)
    @Column(DataType.FLOAT)
    unitDiscountedPrice:number // سعر بعد خصم العرض

    @AllowNull(false)
    @Column(DataType.FLOAT)
    unitFinalPrice: number;       // السعر بعد خصم العرض + extras + varaints

    @AllowNull(false)
    @Column(DataType.FLOAT)
    finalSubtotal: number;       // qty * unitFinalPrice

    @AllowNull(false)
    @Column(DataType.INTEGER)
    quantity: number;

    @AllowNull(true)
    @Default(0)
    @Column(DataType.INTEGER)
    freeQty: number;

    @HasMany(() => OrderItemExtra)
    extras: OrderItemExtra[];

    @HasMany(() => OrderItemVariant)
    variants: OrderItemVariant[];

    @HasMany(() => OrderItemInstruction)
    instructions: OrderItemInstruction[];

    @Column(DataType.TEXT)
    note: string;
}