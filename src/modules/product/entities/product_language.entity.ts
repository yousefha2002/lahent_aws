import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Product } from './product.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'product_languages' })
export class ProductLanguage extends Model {
    @ForeignKey(() => Product)
    @Column(DataType.INTEGER)
    productId: number;

    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    shortDescription: string;

    @Column({ type: DataType.TEXT, allowNull: false })
    longDescription: string;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @BelongsTo(() => Product)
    product: Product;
}