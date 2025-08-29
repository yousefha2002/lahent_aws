import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsDate, ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';
import { OfferType } from 'src/common/enums/offer_type';
import { DurationUnit } from 'src/common/enums/dauration_unit';
import { Type } from 'class-transformer';
import { TargetType } from 'src/common/enums/target_type';

export class CreateOfferDto {
    @ApiProperty({ example: 'Back to School Offer' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ enum: OfferType, example: OfferType.FIXED })
    @IsNotEmpty()
    @IsEnum(OfferType)
    type: OfferType;

    @ApiPropertyOptional({ example: 20, description: 'Fixed discount amount (optional)' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    discountAmount?: number|null;

    @ApiPropertyOptional({ example: 15, description: 'Percentage discount (optional)' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    discountPercentage?: number|null;

    @ApiPropertyOptional({ example: 2, description: 'Buy X quantity (for buy-get offers)' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    buyQty?: number|null;

    @ApiPropertyOptional({ example: 1, description: 'Get Y quantity free (for buy-get offers)' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    getFreeQty?: number|null;

    @ApiProperty({ example: 30 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    duration: number;

    @ApiProperty({ enum: DurationUnit, example: DurationUnit.DAYS })
    @IsNotEmpty()
    @IsEnum(DurationUnit)
    durationUnit: DurationUnit;

    @ApiProperty({ type: String, format: 'date-time', example: '2025-09-01T00:00:00Z' })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @ApiProperty({ enum: TargetType, example: TargetType.PRODUCT })
    @IsNotEmpty()
    @IsEnum(TargetType)
    target: TargetType;

    @ApiPropertyOptional({ type: [Number], example: [1, 2, 3], description: 'Required if target = PRODUCT' })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsInt({ each: true })
    productIds?: number[];

    @ApiPropertyOptional({ type: [Number], example: [5, 8], description: 'Required if target = CATEGORY' })
    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsInt({ each: true })
    categoryIds?: number[];
}