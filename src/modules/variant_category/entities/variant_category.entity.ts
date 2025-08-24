import { Table, Column, Model, DataType, AutoIncrement, PrimaryKey, AllowNull, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductCategoryVariant } from 'src/modules/product_category_variant/entities/product_category_variant.entity';
import { VariantCategoryLanguage } from './variant_category_language.entity';

@Table({ tableName: 'variant_categories' })
export class VariantCategory extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @BelongsToMany(() => Product, () => ProductCategoryVariant)
    products: Product[];

    @HasMany(()=>VariantCategoryLanguage)
    languages:VariantCategoryLanguage
}