import {
    Table,
    Column,
    Model,
    DataType,
    AutoIncrement,
    PrimaryKey,
    ForeignKey,
    BelongsTo,
    AllowNull,
} from 'sequelize-typescript';
import { Sector } from './sector.entity';
import { Language } from 'src/common/enums/language';

@Table({ tableName: 'sector_languages' })
export class SectorLanguage extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Sector)
    @Column(DataType.INTEGER)
    sectorId: number;

    @Column(DataType.STRING)
    name: string;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @BelongsTo(() => Sector)
    sector: Sector;
}