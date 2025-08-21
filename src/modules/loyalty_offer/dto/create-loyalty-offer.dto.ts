import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLoyaltyOfferDto {
    @IsNumber()
    @Min(1)
    amountRequired: number;

    @IsNumber()
    @Min(1)
    bonusAmount: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;
}