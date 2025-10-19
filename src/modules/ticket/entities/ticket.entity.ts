import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    Default,
    AllowNull,
} from 'sequelize-typescript';
import { Store } from 'src/modules/store/entities/store.entity';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { TicketStatus } from 'src/common/enums/ticket_status';
import { TicketType } from 'src/modules/ticket_type/entities/ticket_type.entity';

@Table({ tableName: 'tickets' })
export class Ticket extends Model {
    @Column({ autoIncrement: true, primaryKey: true })
    id: number;

    @Column({
        type: DataType.ENUM('store', 'internal'),
        allowNull: false,
    })
    type: 'store' | 'internal';

    @Default(TicketStatus.PENDING)
    @Column(DataType.ENUM(...Object.values(TicketStatus)))
    status: TicketStatus;

    @AllowNull(false)
    @Column(DataType.STRING)
    subject: string;

    @ForeignKey(() => TicketType)
    @Column(DataType.INTEGER)
    ticketTypeId: number;

    @BelongsTo(() => TicketType)
    ticketType: TicketType;

    @Column(DataType.TEXT)
    description: string;

    @ForeignKey(() => Admin)
    @Column(DataType.INTEGER)
    adminCreatorId?: number;

    @BelongsTo(() => Admin, 'adminCreatorId')
    adminCreator?: Admin;

    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeCreatorId?: number;

    @BelongsTo(() => Store, 'storeCreatorId')
    storeCreator?: Store;

    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId?: number;

    @BelongsTo(() => Store)
    store?: Store;

    @ForeignKey(() => Admin)
    @Column(DataType.INTEGER)
    assignedAdminId?: number;

    @BelongsTo(() => Admin, 'assignedAdminId')
    assignedAdmin?: Admin;

    @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
    })
    rating: number;
}
