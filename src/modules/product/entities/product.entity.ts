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
import { ProductExtra } from 'src/modules/product_extra/entities/product_extra.entity';
import { ProductImage } from 'src/modules/product_image/entities/product_image.entity';
import { ProductInstruction } from 'src/modules/product_instruction/entities/product_instruction.entity';
import { ProductVariant } from 'src/modules/prouduct_variant/entities/prouduct_variant.entity';
import { Store } from 'src/modules/store/entities/store.entity';

@Table({ tableName: 'products' })
export class Product extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Store)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store)
    store: Store;

    @ForeignKey(() => Category)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    categoryId: number;

    @BelongsTo(() => Category)
    category: Category;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    shortDescription: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    longDescription: string;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    basePrice: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    preparationTime: number;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    product_number: number;

    @Default(0)
    @Column(DataType.INTEGER)
    sales: number;

    @Default(true)
    @Column(DataType.BOOLEAN)
    isActive: boolean;

    @HasMany(() => ProductExtra)
    extras: ProductExtra[];

    @HasMany(() => ProductInstruction)
    instructions: ProductInstruction[];

    @HasMany(() => ProductVariant)
    variants: ProductVariant[];

    @HasMany(() => ProductImage)
    images: ProductImage[];

    @HasMany(() => CartItem)
    cartItems: CartItem[];

    @BelongsToMany(() => Offer, () => OfferProduct)
    offers: Offer[];
}