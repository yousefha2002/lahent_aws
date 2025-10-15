import { Table, Column, Model, ForeignKey, HasMany, DataType, PrimaryKey, AutoIncrement, BelongsTo } from 'sequelize-typescript';
import { Product } from 'src/modules/product/entities/product.entity';
import { ProductVariant } from 'src/modules/prouduct_variant/entities/prouduct_variant.entity';
import { VariantCategory } from 'src/modules/variant_category/entities/variant_category.entity';

@Table({ 
    tableName: 'product_category_variants',
    indexes:[
        { name: 'idx_product_variantCategory', unique: true, fields: ['productId', 'variantCategoryId'] },
        { name: 'idx_product_category_variant_productId', fields: ['productId'] },
        { name: 'idx_product_category_variant_variantCategoryId', fields: ['variantCategoryId'] }
    ]
})
export class ProductCategoryVariant extends Model {

    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Product)
    @Column
    productId: number;

    @BelongsTo(() => Product,{onDelete: 'CASCADE'})
    product: Product;

    @ForeignKey(() => VariantCategory)
    @Column
    variantCategoryId: number;

    @BelongsTo(() => VariantCategory)
    variantCategory: VariantCategory;

    @HasMany(()=>ProductVariant)
    variants:ProductVariant[] 
}