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
} from 'sequelize-typescript';
import { Admin } from 'src/modules/admin/entities/admin.entity';
import { Store } from 'src/modules/store/entities/store.entity';
import { Ticket } from 'src/modules/ticket/entities/ticket.entity';

@Table({ tableName: 'ticket_messages' })
export class TicketMessage extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column(DataType.INTEGER)
    id: number;

    @ForeignKey(() => Ticket)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    ticketId: number;
    @BelongsTo(() => Ticket)
    ticket: Ticket;

    @Column(DataType.ENUM('ADMIN', 'STORE'))
    senderType: 'ADMIN' | 'STORE';

    @ForeignKey(() => Admin)
    @Column(DataType.INTEGER)
    adminId: number;

    @ForeignKey(() => Store)
    @Column(DataType.INTEGER)
    storeId: number;

    @AllowNull(false)
    @Column(DataType.TEXT)
    message: string;
}
