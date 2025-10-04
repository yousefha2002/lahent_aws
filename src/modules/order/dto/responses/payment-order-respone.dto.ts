import {ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaymentRedirectDto } from 'src/modules/payment_session/dto/payment-redirect.dto';

export class PaymentResponseDto {
    @Expose()
    @ApiPropertyOptional({ description: 'Indicates if the payment was successful', example: true })
    success?: boolean;

    @Expose()
    @ApiPropertyOptional({ description: 'Message describing payment result', example: 'Paid with points and wallet' })
    message?: string;

    @Expose()
    @ApiPropertyOptional({ type: PaymentRedirectDto })
    redirect?: PaymentRedirectDto;
}