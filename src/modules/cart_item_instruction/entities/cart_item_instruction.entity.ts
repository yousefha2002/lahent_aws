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
import { ProductInstruction } from 'src/modules/product_instruction/entities/product_instruction.entity';


@Table({ 
  tableName: 'cart_item_instructions',
  indexes:[
      {name: 'idx_cartItem_instruction', fields: ['cartItemId'] },
      { name: 'idx_productInstruction', fields: ['productInstructionId'] },
      { name: 'idx_cartItem_productInstruction', fields: ['cartItemId', 'productInstructionId'], unique: true }
  ]
})
export class CartItemInstruction extends Model{
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

    @ForeignKey(() => ProductInstruction)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    productInstructionId: number;
    
    @BelongsTo(() => ProductInstruction,{onDelete: 'CASCADE'})
    productInstruction: ProductInstruction;
}