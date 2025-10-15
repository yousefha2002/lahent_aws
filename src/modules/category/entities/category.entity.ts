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
    HasMany,
    BelongsToMany,
} from 'sequelize-typescript';
import { Offer } from 'src/modules/offer/entities/offer.entity';
import { OfferCategory } from 'src/modules/offer_category/entites/offer_category.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Store } from 'src/modules/store/entities/store.entity';
import { CategoryLanguage } from './category_language.entity';

@Table({ 
    tableName: 'store_categories',paranoid: true,
    indexes: [{ name: 'idx_storeId', fields: ['storeId'] }] 
})
export class Category extends Model{
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

    @HasMany(() => Product)
    products: Product[];

    @BelongsToMany(() => Offer, () => OfferCategory)
    offers: Offer[];

    @HasMany(()=>CategoryLanguage)
    languages:CategoryLanguage
}
