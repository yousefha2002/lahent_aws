import { ApiProperty } from '@nestjs/swagger';
import { SimpleTicketDto } from './simple-ticket.dto';
import { Expose, Type } from 'class-transformer';
import { SimpleAdminDto } from 'src/modules/admin/dto/simple-admin.dto';
import { QuickViewStoreDto } from 'src/modules/store/dto/responses/quick-view-store.dto';

export class ReviewerTicketDto extends SimpleTicketDto{
    @Expose()
    @ApiProperty({ type: () => QuickViewStoreDto })
    @Type(() => QuickViewStoreDto)
    store: QuickViewStoreDto;

    @Expose()
    @ApiProperty({ type: () => SimpleAdminDto, description: 'Admin who assigned the ticket' })
    @Type(() => SimpleAdminDto)
    assignedAdmin: SimpleAdminDto;
}

export class ReviewerTicketPaginationDto {
    @Expose()
    @ApiProperty({ type: [ReviewerTicketDto] })
    @Type(() => ReviewerTicketDto)
    data: ReviewerTicketDto[];

    @Expose()
    @ApiProperty()
    total: number;

    @Expose()
    @ApiProperty()
    totalPages: number;
}
