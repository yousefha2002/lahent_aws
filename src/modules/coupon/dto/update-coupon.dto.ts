import { IsOptional, IsString, IsInt, Min, Max, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCouponDto {
  @ApiPropertyOptional({ example: 'SUMMER2025', description: 'Coupon code' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 10, description: 'Discount percentage (1-100)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercentage?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum number of uses' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsage?: number;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z', description: 'Coupon start date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date | null;

  @ApiPropertyOptional({ example: '2025-09-30T00:00:00.000Z', description: 'Expiry date of the coupon' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date | null;

  @ApiPropertyOptional({ example: true, description: 'Whether the coupon is active' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
