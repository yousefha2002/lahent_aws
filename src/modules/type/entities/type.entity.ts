import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  AutoIncrement,
  PrimaryKey,
  HasMany,
} from 'sequelize-typescript';
import { TypeLanguage } from './type_language.entity';
import { SubType } from 'src/modules/subtype/entities/subtype.entity';

@Table({ tableName: 'types' })
export class Type extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  iconUrl: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  iconPublicId: string;

  @HasMany(() => TypeLanguage)
  languages: TypeLanguage[];

  @HasMany(() => SubType)
  subTypes: SubType[];
}
