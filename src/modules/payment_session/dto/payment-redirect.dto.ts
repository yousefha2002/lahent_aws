import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class PaymentRedirectDto {
    @Expose()
    @ApiProperty({ 
        description: 'Redirect URL for gateway payment', 
        example: 'https://pgapi.edfapay.com/s2s/collector/136519623092025110210' 
    })
    @IsString()
    redirectUrl: string;

    @Expose()
    @ApiProperty({ 
        description: 'Redirect parameters (encoded) for gateway payment', 
        example: 'eyJhY3Rpb24iOiJTQUxFIiwiY2xpZW50X2tleSI6Ij...' 
    })
    @IsString()
    redirectParams: string;

    @Expose()
    @ApiProperty({ 
        description: 'HTTP method to use for redirect (POST/GET)', 
        example: 'POST' 
    })
    @IsString()
    redirectMethod: string;

    @Expose()
    @ApiProperty({ 
        description: 'Payment Id for checking if payment is success', 
        example: 'd76bc9b1-c977-41f8-a459-9d743a96bb99' 
    })
    @IsString()
    paymentId: string;
}