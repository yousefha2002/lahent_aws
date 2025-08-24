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
import { CarModelLanguage } from './car_mode_language.entity';

@Table({ tableName: 'car_models', timestamps: false })
export class CarModel extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @HasMany(() => Car)
  cars: Car[];

  @HasMany(() => CarModelLanguage)
  languages: CarModelLanguage[];
}
