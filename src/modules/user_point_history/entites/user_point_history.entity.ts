import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    AllowNull,
    BelongsTo,
} from 'sequelize-typescript';
import { PointActionSoucre } from 'src/common/enums/point_action_source';
import { PointActionType } from 'src/common/enums/points_action_type';
import { Customer } from 'src/modules/customer/entities/customer.entity';
import { Order } from 'src/modules/order/entities/order.entity';

@Table({ 
    tableName: 'user_points_history',
    indexes: [
        { name: 'idx_user_points_customerId', fields: ['customerId'] },
        { name: 'idx_user_points_customerId_createdAt', fields: ['customerId', 'createdAt'] },
        { name: 'idx_user_points_relatedOrderId', fields: ['relatedOrderId'] },
        { name: 'idx_user_points_type', fields: ['type'] },
        { name: 'idx_user_points_source', fields: ['source'] },
    ]
})
export class UserPointsHistory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Customer)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer,{onDelete: 'SET NULL'})
    customer: Customer;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(PointActionType)))
    type: PointActionType;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(PointActionSoucre)))
    source: PointActionSoucre;

    @AllowNull(false)
    @Column(DataType.INTEGER)
    points: number;

    @ForeignKey(() => Order)
    @AllowNull(true)
    @Column(DataType.INTEGER)
    relatedOrderId?: number;

    @BelongsTo(() => Order)
    relatedOrder?: Order;
}