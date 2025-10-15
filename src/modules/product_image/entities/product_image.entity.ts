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
} from 'sequelize-typescript';
import { Product } from 'src/modules/product/entities/product.entity';


@Table({ 
    tableName: 'product_images' ,
    indexes:[{ name: 'idx_product_images_productId', fields: ['productId'] }]
})
export class ProductImage extends Model{
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
    @Column(DataType.STRING)
    imageUrl:string

    @AllowNull(false)
    @Column(DataType.STRING)
    imagePublicId:string
}