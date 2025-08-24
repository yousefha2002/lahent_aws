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

@Table({ tableName: 'product_instructions' })
export class ProductInstruction extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  productId: number;

  @BelongsTo(() => Product)
  product: Product;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @HasMany(()=>ProductInstructionLanguage)
  languages:ProductInstructionLanguage[]
}
