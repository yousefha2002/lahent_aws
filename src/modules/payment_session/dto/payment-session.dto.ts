import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaymentSessionDto {
    @ApiProperty({ example: '1', description: 'Payment ID' })
    @Expose()
    id: string;

    @ApiProperty({ example: 'success', description: 'Payment status (pending, success, failed)' })
    @Expose()
    status: 'pending' | 'success' | 'failed';

    @ApiProperty({ example: 100, description: 'Payment amount' })
    @Expose()
    amount: number;

    @ApiProperty({ example: 'SAR', description: 'Currency of the payment' })
    @Expose()
    currency: string;
}