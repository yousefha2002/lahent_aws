import {
    Table,
    Column,
    Model,
    ForeignKey,
    PrimaryKey,
    DataType,
    BelongsTo,
} from 'sequelize-typescript';
import { Category } from 'src/modules/category/entities/category.entity';
import { Offer } from 'src/modules/offer/entities/offer.entity';

@Table({ tableName: 'offer_categories' })
export class OfferCategory extends Model {
    @ForeignKey(() => Category)
    @PrimaryKey
    @Column(DataType.INTEGER)
    categoryId: number;

    @BelongsTo(() => Category,{onDelete: 'CASCADE'})
    category: Category;

    @ForeignKey(() => Offer)
    @PrimaryKey
    @Column(DataType.INTEGER)
    offerId: number;

    @BelongsTo(() => Offer)
    offer: Offer;
}