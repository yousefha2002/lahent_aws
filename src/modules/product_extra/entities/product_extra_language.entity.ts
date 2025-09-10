import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { ProductExtra } from './product_extra.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'product_extra_languages' })
export class ProductExtraLanguage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => ProductExtra)
    @Column(DataType.INTEGER)
    productExtraId: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @BelongsTo(() => ProductExtra,{onDelete: 'CASCADE'})
    productExtra: ProductExtra;
}
