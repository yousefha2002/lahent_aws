import { Table, Column, Model, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, AllowNull } from 'sequelize-typescript';
import { ProductVariant } from './prouduct_variant.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'product_variant_languages' })
export class ProductVariantLanguage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => ProductVariant)
    @Column(DataType.INTEGER)
    productVariantId: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @BelongsTo(() => ProductVariant,{onDelete: 'CASCADE'})
    productVariant: ProductVariant;
}