import { ProductExtraLanguage } from './product_extra_language.entity';
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

@Table({ 
  tableName: 'product_extras' ,
  indexes:[
    { name: 'idx_product_extra_productId', fields: ['productId'] },
    { name: 'idx_product_extra_productId_isActive', fields: ['productId', 'isActive'] },
  ]
})
export class ProductExtra extends Model {
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

  @AllowNull(false)
  @Column(DataType.FLOAT)
  additionalPrice: number;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @HasMany(()=>ProductExtraLanguage)
  languages:ProductExtraLanguage[]
}
