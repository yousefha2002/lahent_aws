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
import { ProductVariant } from 'src/modules/prouduct_variant/entities/prouduct_variant.entity';

@Table({ tableName: 'order_item_variants' })
export class OrderItemVariant extends Model{
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

    @ForeignKey(() => ProductVariant)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    variantId: number;
                
    @BelongsTo(() => ProductVariant,{onDelete: 'SET NULL'})
    variant: ProductVariant;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    additionalPrice: number;

    @AllowNull(true)
    @Column(DataType.STRING)
    imageUrl: string;
}