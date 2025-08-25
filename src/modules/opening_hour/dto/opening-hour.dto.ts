import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OpeningHourDTO {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 'mon' })
    @Expose()
    day: string;

    @ApiProperty({ example: '08:00', nullable: true })
    @Expose()
    openTime: string | null;

    @ApiProperty({ example: '18:00', nullable: true })
    @Expose()
    closeTime: string | null;
}