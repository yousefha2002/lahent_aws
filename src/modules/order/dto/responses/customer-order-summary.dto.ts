import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CustomerOrderSummaryDto {
    @ApiProperty()
    @Expose()
    youPaid: number;

    @ApiProperty()
    @Expose()
    youSaved: number;

    @ApiProperty()
    @Expose()
    storesOffer: number;
}