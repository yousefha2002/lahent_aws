import {
    Table,
    Column,
    Model,
    ForeignKey,
    PrimaryKey,
    DataType,
    BelongsTo,
    Default,
} from 'sequelize-typescript';
import { Product } from 'src/modules/product/entities/product.entity';
import { Offer } from 'src/modules/offer/entities/offer.entity';

@Table({ tableName: 'offer_products' })
export class OfferProduct extends Model {
    @ForeignKey(() => Product)
    @PrimaryKey
    @Column(DataType.INTEGER)
    productId: number;

    @BelongsTo(() => Product)
    Product: Product;

    @ForeignKey(() => Offer)
    @PrimaryKey
    @Column(DataType.INTEGER)
    offerId: number;

    @BelongsTo(() => Offer)
    offer: Offer;
}