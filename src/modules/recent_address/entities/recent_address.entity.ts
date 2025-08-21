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

@Table({ tableName: 'recent_addresses' })
export class RecentAddress extends Model {
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
    @Column(DataType.STRING)
    address: string;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    lat: number;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    lng: number;
}
