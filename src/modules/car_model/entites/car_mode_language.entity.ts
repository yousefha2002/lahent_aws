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
import { CarModel } from './car_model.entity';

@Table({ tableName: 'car_model_languages' })
export class CarModelLanguage extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => CarModel)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  carModelId: number;

  @BelongsTo(() => CarModel)
  carModel: CarModel;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Language)))
  languageCode: Language;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
