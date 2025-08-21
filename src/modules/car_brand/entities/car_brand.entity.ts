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

@Table({ tableName: 'car_brands',timestamps: false})
export class CarBrand extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @AllowNull(false)
    @Column({type:DataType.STRING,unique: true})
    name: string;

    @HasMany(() => Car)
    cars: Car[];
}