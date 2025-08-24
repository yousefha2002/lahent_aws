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
import { CarTypeLanguage } from './car_type_language.entity';

@Table({ tableName: 'car_types', timestamps: false })
export class CarType extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @HasMany(() => Car)
  cars: Car[];

  @HasMany(() => CarTypeLanguage)
  languages: CarTypeLanguage[];
}
