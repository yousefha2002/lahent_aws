import { Table, Column, Model, DataType, AllowNull, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey } from 'sequelize-typescript';
import { Category } from './category.entity';
import { Language } from 'src/common/enums/language';

@Table({ 
    tableName: 'category_languages',
    indexes:[
        { name: 'idx_categoryId', fields: ['categoryId'] },
        { name: 'idx_categoryId_languageCode', fields: ['categoryId', 'languageCode'] },
        { name: 'idx_title_languageCode', fields: ['title', 'languageCode'] }
        ]
    })
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