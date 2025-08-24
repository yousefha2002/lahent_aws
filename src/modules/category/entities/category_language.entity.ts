import { Table, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey } from 'sequelize-typescript';
import { Category } from './category.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'category_languages' })
export class CategoryLanguage extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Category)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    categoryId: number;

    @BelongsTo(() => Category)
    category: Category;

    @AllowNull(false)
    @Column(DataType.STRING)
    title: string;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;
}