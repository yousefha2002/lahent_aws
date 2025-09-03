import {
    Table,
    Column,
    Model,
    DataType,
    AutoIncrement,
    PrimaryKey,
    ForeignKey,
    AllowNull,
    BelongsTo,
} from 'sequelize-typescript';

import { Customer } from 'src/modules/customer/entities/customer.entity';

@Table({ tableName: 'addresses' })
export class Address extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Customer)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer)
    customer: Customer;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    lat: number;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    lng: number;

    @AllowNull(false)
    @Column(DataType.STRING)
    label: string;
}
