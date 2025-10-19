import { Table,Model,Column, HasMany, ForeignKey, DataType, AllowNull, BelongsTo } from "sequelize-typescript";
import { TicketType } from "./ticket_type.entity";
import { Language } from "src/common/enums/language";

@Table({ tableName: 'ticket_type_languages' })
export class TicketTypeLanguage extends Model<TicketTypeLanguage> {
    @Column({ autoIncrement: true, primaryKey: true })
    id: number;

    @ForeignKey(() => TicketType)
    @Column(DataType.INTEGER)
    ticketTypeId: number;

    @BelongsTo(() => TicketType)
    ticketType: TicketType;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(Language)))
    languageCode: Language;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;
}
