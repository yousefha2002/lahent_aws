import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderAnalyticsResponseDto {
    @Expose()
    @ApiProperty({ example: 15, description: 'Average preparation time in minutes' })
    averagePrepTime: number;

    @Expose()
    @ApiProperty({ example: 0.35, description: 'Customer repeat rate (0–1)' })
    customerRepeatRate: number;
}