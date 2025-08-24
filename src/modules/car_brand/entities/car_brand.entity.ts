import {
  Table,
  Column,
  Model,
  DataType,
  AutoIncrement,
  PrimaryKey,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { Car } from 'src/modules/car/entities/car.entity';
import { CarBrandLanguage } from './car_brand.languae.entity';

@Table({ tableName: 'car_brands', timestamps: false })
export class CarBrand extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @HasMany(() => Car)
  cars: Car[];

  @HasMany(() => CarBrandLanguage)
  languages: CarBrandLanguage[];
}
