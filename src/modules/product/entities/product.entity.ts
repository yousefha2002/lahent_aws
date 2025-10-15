import {
    Table,
    Column,
    Model,
    DataType,
    AllowNull,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    Default,
    HasMany,
    BelongsToMany,
} from 'sequelize-typescript';
import { CartItem } from 'src/modules/cart_item/entities/cart_item.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Offer } from 'src/modules/offer/entities/offer.entity';
import { OfferProduct } from 'src/modules/offer_product/entites/offer_product.entity';
import { ProductCategoryVariant } from 'src/modules/product_category_variant/entities/product_category_variant.entity';
import { ProductExtra } from 'src/modules/product_extra/entities/product_extra.entity';
import { ProductImage } from 'src/modules/product_image/entities/product_image.entity';
import { ProductInstruction } from 'src/modules/product_instruction/entities/product_instruction.entity';
import { Store } from 'src/modules/store/entities/store.entity';
import { VariantCategory } from 'src/modules/variant_category/entities/variant_category.entity';
import { ProductLanguage } from './product_language.entity';
import { OrderItem } from 'src/modules/order_item/entities/order_item.entity';

@Table({ 
    tableName: 'products',paranoid: true ,
    indexes:[
        { name: 'idx_product_storeId', fields: ['storeId'] },
        { name: 'idx_product_storeId_categoryId', fields: ['storeId', 'categoryId'] },
        { name: 'idx_product_isActive', fields: ['isActive'] },
        { name: 'idx_product_createdAt', fields: ['createdAt'] },
        { name: 'idx_product_sales', fields: ['sales'] },
        { name: 'uniq_store_productNumber', unique: true, fields: ['storeId', 'productNumber'] },
    ]
})
export class Product extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Store)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store,{onDelete: 'CASCADE'})
    store: Store;

    @ForeignKey(() => Category)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    categoryId: number;

    @BelongsTo(() => Category)
    category: Category;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    basePrice: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    preparationTime: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    productNumber: number;

    @Default(0)
    @Column(DataType.INTEGER)
    sales: number;

    @Default(false)
    @Column(DataType.BOOLEAN)
    isActive: boolean;

    @HasMany(() => ProductExtra)
    extras: ProductExtra[];

    @HasMany(() => ProductInstruction)
    instructions: ProductInstruction[];

    @BelongsToMany(() => VariantCategory, () => ProductCategoryVariant)
    variantCategories: VariantCategory[];

    @HasMany(() => ProductCategoryVariant)
    productCategoryVariants: ProductCategoryVariant[];

    @HasMany(() => ProductImage)
    images: ProductImage[];

    @HasMany(() => CartItem)
    cartItems: CartItem[];

    @HasMany(()=>ProductLanguage)
    languages:ProductLanguage

    @BelongsToMany(() => Offer, () => OfferProduct)
    offers: Offer[];

    @HasMany(() => OrderItem)   
    orderItems: OrderItem[];
}