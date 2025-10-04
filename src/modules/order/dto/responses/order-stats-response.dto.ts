import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StoreOrderStatsResponseDto {
    @Expose()
    @ApiProperty({ description: 'Number of completed orders', example: 10 })
    completedCount: number;

    @Expose()
    @ApiProperty({ description: 'Number of cancelled/rejected/expired confirmation orders', example: 3 })
    cancelledCount: number;

    @Expose()
    @ApiProperty({ description: 'Number of scheduled orders', example: 5 })
    scheduledCount: number;
}
