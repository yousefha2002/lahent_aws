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
    @ApiPropertyOptional({ description: 'Redirect URL for gateway payment', example: 'https://pgapi.edfapay.com/s2s/collector/136519623092025110210' })
    redirectUrl?: string;

    @Expose()
    @ApiPropertyOptional({ description: 'Redirect parameters (encoded) for gateway payment', example: 'eyJhY3Rpb24iOiJTQUxFIiwiY2xpZW50X2tleSI6Ij...' })
    redirectParams?: string;

    @Expose()
    @ApiPropertyOptional({ description: 'HTTP method to use for redirect (POST/GET)', example: 'POST' })
    redirectMethod?: string;

    @Expose()
    @ApiPropertyOptional({ description: 'Payment Id for checking if payment is success', example: 'd76bc9b1-c977-41f8-a459-9d743a96bb99' })
    paymentId?: string;
}