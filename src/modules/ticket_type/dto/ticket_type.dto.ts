import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TicketTypeLanguageDto {
    @ApiProperty({ example: 'Complaint' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'en' })
    @Expose()
    languageCode: string;
}

export class TicketTypeDto {
    @ApiProperty({ example: '1' })
    @Expose()
    id: string;

    @ApiProperty({ type: [TicketTypeLanguageDto] })
    @Expose()
    @Type(() => TicketTypeLanguageDto)
    languages: TicketTypeLanguageDto[];
}
