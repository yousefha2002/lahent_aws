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

@Table({ tableName: 'car_types',timestamps: false })
export class CarType extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @HasMany(() => Car)
    cars: Car[];
}