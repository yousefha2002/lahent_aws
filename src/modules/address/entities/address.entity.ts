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
import { AddressLabel } from 'src/common/enums/address_label';

import { Customer } from 'src/modules/customer/entities/customer.entity';

@Table({ 
    tableName: 'addresses',
    indexes:[
        { name: 'idx_customer_createdAt', fields: ['customerId', 'createdAt'] }, 
        { name: 'idx_customer', fields: ['customerId'] },
    ] 
    
})
export class Address extends Model{
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Customer)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer,{onDelete: 'CASCADE'})
    customer: Customer;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    lat: number;

    @AllowNull(false)
    @Column(DataType.FLOAT)
    lng: number;

    @AllowNull(false)
    @Column({type: DataType.ENUM(...Object.values(AddressLabel)),})
    label: AddressLabel;
}
