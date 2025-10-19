import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    AllowNull,
    ForeignKey,
    BelongsTo,
    Default,
} from 'sequelize-typescript';
import { Store } from 'src/modules/store/entities/store.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { TicketStatus } from 'src/common/enums/ticket_status';

@Table({ tableName: 'tickets' })
export class Ticket extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Store)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    storeId: number;

    @BelongsTo(() => Store)
    store: Store;

    @ForeignKey(() => Admin)
    @Column(DataType.INTEGER)
    reviewerId: number; // الأدمن الذي راجع التذكرة أولًا

    @BelongsTo(() => Admin, 'reviewerId')
    reviewer: Admin;

    @ForeignKey(() => Admin)
    @Column(DataType.INTEGER)
    assignedAdminId: number; // الأدمن المسؤول عن المتابعة

    @BelongsTo(() => Admin, 'assignedAdminId')
    assignedAdmin: Admin;

    @AllowNull(false)
    @Column(DataType.STRING)
    subject: string;

    @AllowNull(false)
    @Column(DataType.TEXT)
    description: string;

    @Default(TicketStatus.PENDING)
    @Column(DataType.ENUM(...Object.values(TicketStatus)))
    status: TicketStatus;

    @Column(DataType.DATE)
    closedAt: Date;

    @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
        min: 1,
        max: 5,
        },
    })
    rating: number;
}
