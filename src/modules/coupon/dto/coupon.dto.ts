import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CouponDto {
    @ApiProperty({ example: 1, description: 'Coupon ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'SUMMER2025', description: 'Coupon code' })
    @Expose()
    code: string;

    @ApiProperty({ example: 10, description: 'Discount percentage' })
    @Expose()
    discountPercentage: number;

    @ApiProperty({ example: 100, description: 'Maximum number of uses' })
    @Expose()
    maxUsage: number;

    @ApiProperty({ example: 25, description: 'Number of times coupon has been used' })
    @Expose()
    usedCount: number;

    @ApiProperty({ example: '2025-09-30T00:00:00.000Z', description: 'Coupon expiry date' })
    @Expose()
    expiryDate: Date;

    @ApiProperty({ example: '2025-09-30T00:00:00.000Z', description: 'Coupon start date' })
    @Expose()
    startDate: Date;

    @ApiProperty({ example: true, description: 'Whether the coupon is active' })
    @Expose()
    isActive: boolean;
}