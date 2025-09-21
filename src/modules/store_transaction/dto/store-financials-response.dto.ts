import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StoreFinancialsResponseDto {
    @Expose()
    @ApiProperty({ description: 'Available balance for the store', example: 1500.75 })
    availableBalance: number;

    @Expose()
    @ApiProperty({ description: 'Total amount of canceled transactions', example: 200.5 })
    totalCanceled: number;

    @Expose()
    @ApiProperty({ description: 'Total amount of refunded transactions', example: 100.25 })
    totalRefunded: number;

    @Expose()
    @ApiProperty({ description: 'Total earnings from completed transactions', example: 1800.0 })
    totalEarning: number;  //
}
