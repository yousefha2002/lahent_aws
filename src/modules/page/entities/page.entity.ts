import {Table,Column,Model,DataType,AllowNull,AutoIncrement,PrimaryKey,HasMany,} from 'sequelize-typescript';
import { PageLanguage } from './page_language.entity';
import { PageType } from 'src/common/enums/page_type';

@Table({ tableName: 'pages' })
export class Page extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(PageType)))
    type: PageType;

    @HasMany(() => PageLanguage)
    languages: PageLanguage[];
}