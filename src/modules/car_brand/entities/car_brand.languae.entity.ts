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
import { CarBrand } from './car_brand.entity';

@Table({ tableName: 'car_brand_languages' })
export class CarBrandLanguage extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => CarBrand)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  carBrandId: number;

  @BelongsTo(() => CarBrand)
  carBrand: CarBrand;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Language)))
  languageCode: Language;

  @AllowNull(false)
  @Column(DataType.STRING)
  name: string;
}
