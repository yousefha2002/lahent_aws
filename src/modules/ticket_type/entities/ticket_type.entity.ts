import { Table,Model,Column, HasMany } from "sequelize-typescript";
import { TicketTypeLanguage } from "./ticket_type_language.entity";

@Table({ tableName: 'ticket_types' })
export class TicketType extends Model{
    @Column({ autoIncrement: true, primaryKey: true })
    id: number;

    @HasMany(() => TicketTypeLanguage)
    languages: TicketTypeLanguage[];
}