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
} from 'sequelize-typescript';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';
import { ProductExtra } from 'src/modules/product_extra/entities/product_extra.entity';

@Table({ tableName: 'order_item_extras' })
export class OrderItemExtra extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => OrderItem)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    orderItemId: number;

    @BelongsTo(() => OrderItem)
    orderItem: OrderItem;
    
    @ForeignKey(() => ProductExtra)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    extraId: number;
        
    @BelongsTo(() => ProductExtra)
    extra: ProductExtra;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    price: number;
}