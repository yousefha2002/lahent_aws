import { Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseloyaltyOfferDto {
    @ApiProperty({ example: 1, description: 'Offer ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 100, description: 'Amount required to redeem offer' })
    @Expose()
    amountRequired: number;

    @ApiProperty({ example: 10, description: 'Bonus amount received' })
    @Expose()
    bonusAmount: number;
}

export class ExtendedLoyaltyOfferDto extends BaseloyaltyOfferDto {
    @ApiProperty({ example: true, description: 'Whether the offer is active' })
    @Expose()
    isActive: boolean;

    @ApiPropertyOptional({ example: '2025-08-29T00:00:00.000Z', description: 'Offer start date' })
    @Transform(({ value }) => value ?? null)
    @Expose()
    startDate: Date;

    @ApiPropertyOptional({ example: '2025-09-30T00:00:00.000Z', description: 'Offer end date' })
    @Transform(({ value }) => value ?? null)
    @Expose()
    endDate: Date;
}