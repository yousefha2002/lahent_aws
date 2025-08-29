import {ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaymentResponseDto {
    @Expose()
    @ApiPropertyOptional({ description: 'Indicates if the payment was successful', example: true })
    success?: boolean;

    @Expose()
    @ApiPropertyOptional({ description: 'Message describing payment result', example: 'Paid with points and wallet' })
    message?: string;

    @Expose()
    @ApiPropertyOptional({ description: 'Checkout URL if payment via gateway is required', example: 'https://payment-provider.com/checkout/abc123' })
    checkoutUrl?: string;
}