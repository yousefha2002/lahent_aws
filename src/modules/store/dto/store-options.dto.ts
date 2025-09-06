import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OpeningHourDTO } from 'src/modules/opening_hour/dto/opening-hour.dto';

export class StoreOptionsDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: true })
    @Expose()
    drive_thru: boolean;

    @ApiProperty({ example: false })
    @Expose()
    in_store: boolean;

    @ApiProperty({ type: [OpeningHourDTO] })
    @Expose()
    @Type(() => OpeningHourDTO)
    openingHours: OpeningHourDTO[];
}