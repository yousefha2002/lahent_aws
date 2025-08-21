import {
  Table,
  Column,
  Model,
  DataType,
  AllowNull,
  AutoIncrement,
  PrimaryKey,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { SubTypeLanguage } from './sybtype_language.entity';
import { Type } from 'src/modules/type/entities/type.entity';

@Table({ tableName: 'sub_types' })
export class SubType extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @HasMany(() => SubTypeLanguage)
  languages: SubTypeLanguage[];

  @ForeignKey(() => Type)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  typeId: number;

  @BelongsTo(() => Type)
  type: Type;
}
