import {Table,Column,Model,DataType,AllowNull,ForeignKey,PrimaryKey,AutoIncrement,BelongsTo} from 'sequelize-typescript';
import { Language } from 'src/common/enums/language';
import { Page } from './page.entity';

@Table({ tableName: 'page_languages' })
export class PageLanguage extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Page)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    pageId: number;

    @BelongsTo(() => Page)
    page: Page;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @AllowNull(false)
    @Column(DataType.TEXT)
    content: string;
}