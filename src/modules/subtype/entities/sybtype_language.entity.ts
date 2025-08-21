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

import { Language } from 'src/common/enums/language';
import { SubType } from './subtype.entity';

@Table({ tableName: 'sub_type_languages' })
export class SubTypeLanguage extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => SubType)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  subTypeId: number;

  @BelongsTo(() => SubType)
  subType: SubType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Language)))
  languageCode: Language;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
