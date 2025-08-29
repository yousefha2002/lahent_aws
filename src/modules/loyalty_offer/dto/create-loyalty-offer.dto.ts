import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLoyaltyOfferDto {
    @ApiProperty({ example: 100, description: 'Amount required to redeem offer' })
    @IsNumber()
    @Min(1)
    amountRequired: number;

    @ApiProperty({ example: 10, description: 'Bonus amount received' })
    @IsNumber()
    @Min(1)
    bonusAmount: number;

    @ApiPropertyOptional({ example: '2025-08-29T00:00:00.000Z', description: 'Offer start date' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @ApiPropertyOptional({ example: '2025-09-30T00:00:00.000Z', description: 'Offer end date' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;
}