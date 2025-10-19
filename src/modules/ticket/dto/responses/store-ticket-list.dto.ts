import { ApiProperty } from '@nestjs/swagger';
import { SimpleTicketDto } from './simple-ticket.dto';
import { Expose, Type } from 'class-transformer';

export class StoreListPagination {
    @ApiProperty({ type: [SimpleTicketDto] })
    @Expose()
    @Type(() => SimpleTicketDto)
    data: SimpleTicketDto[];

    @ApiProperty()
    @Expose()
    total: number;

    @ApiProperty()
    @Expose()
    totalPages: number;
}