import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCouponDto {
    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    discountPercentage?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    maxUsage?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    expiryDate?: Date;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;
}