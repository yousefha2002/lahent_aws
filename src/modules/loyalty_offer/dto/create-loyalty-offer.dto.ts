import { IsDate, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoyaltyOfferDto {
    @ApiProperty({ example: 100, description: 'Amount required to redeem offer' })
    @IsNumber()
    @Min(1)
    amountRequired: number;

    @ApiProperty({ example: 10, description: 'Bonus amount received' })
    @IsNumber()
    @Min(1)
    bonusAmount: number;

    @ApiProperty({ example: '2025-08-29T00:00:00.000Z', nullable: true, required: false })
    @IsOptional()
    @Transform(({ value }) => (value === null || value === 'null' ? null : new Date(value)))
    @IsDate({ message: 'startDate must be a valid date' })
    startDate?: Date | null;

    @ApiProperty({ example: '2025-09-30T00:00:00.000Z', nullable: true, required: false })
    @IsOptional()
    @Transform(({ value }) => (value === null || value === 'null' ? null : new Date(value)))
    @IsDate({ message: 'endDate must be a valid date' })
    endDate?: Date | null;
}