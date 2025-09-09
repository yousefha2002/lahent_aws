import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StoreCommissionDto {
    @ApiProperty({ description: 'The unique ID of the commission record',example:1 })
    @Expose()
    id: number;

    @ApiProperty({ description: 'The ID of the store associated with this commission' ,example:2})
    @Expose()
    storeId: number;

    @ApiProperty({ description: 'The commission percentage for the store',example:5 })
    @Expose()
    commissionPercent: number;
}