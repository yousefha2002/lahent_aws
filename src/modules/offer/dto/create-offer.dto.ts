import {IsNotEmpty,IsString,IsEnum,IsOptional,IsNumber,Min,Max,IsDate, ArrayNotEmpty, ArrayUnique,IsArray,IsInt} from 'class-validator';
import { OfferType } from 'src/common/enums/offer_type';
import { DurationUnit } from 'src/common/enums/dauration_unit';
import { Type } from 'class-transformer';
import { TargetType } from 'src/common/enums/target_type';

export class CreateOfferDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEnum(OfferType)
    type: OfferType;

    @IsOptional()
    @IsNumber()
    @Min(1)
    discountAmount?: number|null;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    discountPercentage?: number|null;

    @IsOptional()
    @IsNumber()
    @Min(1)
    buyQty?: number|null;

    @IsOptional()
    @IsNumber()
    @Min(1)
    getFreeQty?: number|null;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    duration: number;

    @IsNotEmpty()
    @IsEnum(DurationUnit)
    durationUnit: DurationUnit;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate: Date

    @IsNotEmpty()
    @IsEnum(TargetType)
    target: TargetType;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsInt({ each: true })
    productIds?: number[];

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    @IsInt({ each: true })
    categoryIds?: number[];
}