import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { TicketStatus } from "src/common/enums/ticket_status";

export class SimpleTicketDto {
    @Expose()
    @ApiProperty()
    id:number

    @Expose()
    subject:string

    @Expose()
    @ApiProperty()
    description:string

    @Expose()
    @ApiProperty({example:"2025-10-19T08:50:31.000Z"})
    closedAt:Date | null

    @Expose()
    @ApiProperty()
    createdAt:Date

    @Expose()
    @ApiProperty()
    rating:number

    @ApiProperty({enum:TicketStatus})
    @Expose()
    status:TicketStatus
}