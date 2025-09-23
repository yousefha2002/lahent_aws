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
    @ApiProperty({ example: '2025-12-31', description: 'Expiry date' })
    expiryDate: Date;

    @Expose()
    @ApiProperty({ example: 'John Doe', description: 'Card holder name' })
    cardHolderName: string;

    @Expose()
    @ApiProperty({ example: true, description: 'Is default card?' })
    isDefault: boolean;
}