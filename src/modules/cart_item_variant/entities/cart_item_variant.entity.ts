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
import { ProductVariant } from 'src/modules/prouduct_variant/entities/prouduct_variant.entity';


@Table({ tableName: 'cart_item_variants' })
export class CartItemVariant extends Model{
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

    @ForeignKey(() => ProductVariant)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    productVariantId: number;

    @BelongsTo(() => ProductVariant,{onDelete: 'CASCADE'})
    productVariant: ProductVariant;
}