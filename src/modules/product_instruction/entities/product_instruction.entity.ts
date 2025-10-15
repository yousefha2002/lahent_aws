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
  Default,
  HasMany,
} from 'sequelize-typescript';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductInstructionLanguage } from './product_instruction_language.dto';

@Table({ 
  tableName: 'product_instructions' ,
  indexes:[
    { name: 'idx_product_instruction_productId', fields: ['productId'] },
    { name: 'idx_product_instruction_productId_isActive', fields: ['productId', 'isActive'] }
  ]
})
export class ProductInstruction extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  productId: number;

  @BelongsTo(() => Product,{onDelete: 'CASCADE'})
  product: Product;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @HasMany(()=>ProductInstructionLanguage)
  languages:ProductInstructionLanguage[]
}
