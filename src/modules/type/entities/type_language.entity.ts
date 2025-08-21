import {
    Table,
    Column,
    Model,
    DataType,
    AllowNull,
    ForeignKey,
    PrimaryKey,
    AutoIncrement,
    BelongsTo,
} from 'sequelize-typescript';

import { Type } from './type.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'type_languages' })
export class TypeLanguage extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Type)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    typeId: number;

    @BelongsTo(() => Type)
    type: Type;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;
}
