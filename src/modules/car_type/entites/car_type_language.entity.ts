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
import { CarType } from './car_type.entity';

@Table({ tableName: 'car_type_languages' })
export class CarTypeLanguage extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => CarType)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  carTypeId: number;

  @BelongsTo(() => CarType)
  carType: CarType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Language)))
  languageCode: Language;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
