import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CouponValidateDto {
    @ApiProperty({ example: 1, description: 'Coupon ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'SUMMER2025', description: 'Coupon code' })
    @Expose()
    code: string;

    @ApiProperty({ example: 10, description: 'Discount percentage' })
    @Expose()
    discountPercentage: number;
}