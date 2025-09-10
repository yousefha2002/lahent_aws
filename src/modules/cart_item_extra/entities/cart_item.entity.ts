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
import { CartItem } from 'src/modules/cart_item/entities/cart_item.entity';
import { ProductExtra } from 'src/modules/product_extra/entities/product_extra.entity';


@Table({ tableName: 'cart_item_extras' })
export class CartItemExtra extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => CartItem)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    cartItemId: number;

    @BelongsTo(() => CartItem,{onDelete: 'CASCADE'})
    cartItem: CartItem;

    @ForeignKey(() => ProductExtra)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    productExtraId: number;

    @BelongsTo(() => ProductExtra,{onDelete: 'CASCADE'})
    productExtra: ProductExtra;
}