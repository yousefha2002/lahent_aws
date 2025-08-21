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

export class CreateCouponDto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(100)
    discountPercentage: number;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    maxUsage: number;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    expiryDate: Date;

    @IsBoolean()
    @IsOptional()
    isActive: boolean;
}