import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull, AutoIncrement, PrimaryKey } from 'sequelize-typescript';
import { Language } from 'src/common/enums/language';
import { VariantCategory } from './variant_category.entity';

@Table({ tableName: 'variant_category_languages' })
export class VariantCategoryLanguage extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => VariantCategory)
    @Column(DataType.INTEGER)
    variantCategoryId: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @BelongsTo(() => VariantCategory)
    variantCategory: VariantCategory;
}
