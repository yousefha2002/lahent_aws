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
import { Order } from 'src/modules/order/entities/order.entity'; // فرضًا عندك هذا الكيان

@Table({ tableName: 'user_points_history' })
export class UserPointsHistory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Customer)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    customerId: number;

    @BelongsTo(() => Customer)
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