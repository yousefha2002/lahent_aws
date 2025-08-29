import {
    IsNotEmpty,
    IsString,
    Min,
    Max,
    IsInt,
    IsDate,
    IsBoolean,
    IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
    @ApiProperty({ example: 'SUMMER2025', description: 'Coupon code' })
    @IsNotEmpty()
    @IsString()
    code: string;

    @ApiProperty({ example: 10, description: 'Discount percentage (1-100)' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(100)
    discountPercentage: number;

    @ApiProperty({ example: 100, description: 'Maximum number of uses' })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    maxUsage: number;

    @ApiProperty({ example: '2025-09-30T00:00:00.000Z', description: 'Coupon expiry date' })
    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    expiryDate: Date;

    @ApiPropertyOptional({ example: true, description: 'Whether the coupon is active' })
    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}