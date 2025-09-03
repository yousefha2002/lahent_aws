import {
    Table,
    Column,
    Model,
    DataType,
    AutoIncrement,
    PrimaryKey,
    HasMany,
} from 'sequelize-typescript';
import { SectorLanguage } from './sectore_langauge.entity';

@Table({ tableName: 'sectors' })
export class Sector extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @HasMany(() => SectorLanguage)
    languages: SectorLanguage[];
}