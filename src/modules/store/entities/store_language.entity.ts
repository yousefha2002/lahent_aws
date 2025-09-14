import {Table,Column,Model,DataType,AllowNull, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement} from 'sequelize-typescript';

import { Language } from 'src/common/enums/language';
import { Store } from './store.entity';

@Table({ tableName: 'store_languages' })
export class StoreLanguage extends Model {

    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store,{onDelete: 'CASCADE'})
    store: Store;

    @Column(DataType.STRING)
    name: string;

    @Column(DataType.STRING)
    brand: string;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;
}