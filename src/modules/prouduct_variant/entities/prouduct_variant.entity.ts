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
import { ProductCategoryVariant } from 'src/modules/product_category_variant/entities/product_category_variant.entity';
import { ProductVariantLanguage } from './product_variant_language.entity';

@Table({ 
  tableName: 'product_variants' ,
  indexes:[
    { name: 'idx_product_variant_productCategoryVariantId', fields: ['productCategoryVariantId'] },
    { name: 'idx_product_variant_productCategoryVariantId_isActive', fields: ['productCategoryVariantId', 'isActive'] }
  ]
})
export class ProductVariant extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  additionalPrice: number;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @AllowNull(true)
  @Column(DataType.STRING)
  imageUrl:string

  @AllowNull(true)
  @Column(DataType.STRING)
  imagePublicId:string

  @ForeignKey(() => ProductCategoryVariant)
  @Column(DataType.INTEGER)
  productCategoryVariantId: number;

  @BelongsTo(() => ProductCategoryVariant,{onDelete: 'CASCADE'})
  productCategoryVariant: ProductCategoryVariant;

  @HasMany(()=>ProductVariantLanguage)
  langauges:ProductVariantLanguage
}
