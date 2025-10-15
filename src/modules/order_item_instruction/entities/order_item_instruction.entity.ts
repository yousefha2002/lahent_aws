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
import { ProductInstruction } from 'src/modules/product_instruction/entities/product_instruction.entity';

@Table({ 
  tableName: 'order_item_instructions' ,
  indexes: [
    { name: 'idx_order_item_instructions_orderItemId', fields: ['orderItemId'] }, 
    { name: 'idx_order_item_instructions_instructionId', fields: ['instructionId'] },
  ],
})
export class OrderItemInstruction extends Model{
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

    @ForeignKey(() => ProductInstruction)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    instructionId: number;
            
    @BelongsTo(() => ProductInstruction,{onDelete: 'SET NULL'})
    instruction: ProductInstruction;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;
}