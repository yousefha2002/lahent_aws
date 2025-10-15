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
  HasMany,
} from 'sequelize-typescript';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { CartItemExtra } from 'src/modules/cart_item_extra/entities/cart_item.entity';
import { CartItemInstruction } from 'src/modules/cart_item_instruction/entities/cart_item_instruction.entity';
import { CartItemVariant } from 'src/modules/cart_item_variant/entities/cart_item_variant.entity';
import { Product } from 'src/modules/product/entities/product.entity';

@Table({ 
  tableName: 'cart_items',
  indexes:[{ name: 'idx_cart_product', fields: ['cartId', 'productId'], unique: true }]
})
export class CartItem extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Cart)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  cartId: number;

  @BelongsTo(() => Cart,{onDelete: 'CASCADE'})
  cart: Cart;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  productId: number;

  @BelongsTo(() => Product,{onDelete: 'CASCADE'})
  product: Product;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  quantity: number;

  @Column(DataType.TEXT)
  note: string;

  @HasMany(() => CartItemExtra)
  extras: CartItemExtra[];

  @HasMany(() => CartItemInstruction)
  instructions: CartItemInstruction[];

  @HasMany(() => CartItemVariant)
  variants: CartItemVariant[];
}
