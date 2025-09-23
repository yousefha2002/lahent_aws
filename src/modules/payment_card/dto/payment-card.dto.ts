import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaymentCardDto {
    @Expose()
    @ApiProperty({ example: 1, description: 'Payment card ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: '12341234123412', description: 'Card number' })
    cardNumber: string;

    @Expose()
    @ApiProperty({ example: '2026-09', description: 'Expiry date' })
    expiryDate: string;

    @Expose()
    @ApiProperty({ example: 'John Doe', description: 'Card holder name' })
    cardHolderName: string;

    @Expose()
    @ApiProperty({ example: 'Card Name', description: 'Card name' })
    cardName: string;


    @Expose()
    @ApiProperty({ example: true, description: 'Is default card?' })
    isDefault: boolean;
}