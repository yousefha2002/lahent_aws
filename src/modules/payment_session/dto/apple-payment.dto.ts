import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplePayPaymentDTO {
    @ApiProperty({ description: 'Unique transaction identifier', example: '706eb1272670cb7e0c4e806afffa275ee8aa696a898f7062d9ce345a058cf436' })
    @IsString()
    @IsNotEmpty()
    transactionIdentifier: string;

    @ApiProperty({
        description: 'Payment method details',
        type: Object,
        example: { network: 'Visa', type: 'debit', displayName: 'Visa 8918' },
    })
    @IsObject()
    @IsNotEmpty()
    paymentMethod: {
        network: string;
        type: string;
        displayName: string;
    };

    @ApiProperty({ description: 'Payment version', example: 'EC_v1' })
    @IsString()
    @IsNotEmpty()
    version: string;

    @ApiProperty({ description: 'Encrypted payment data', example: 'long-encrypted-token...' })
    @IsString()
    @IsNotEmpty()
    data: string;

    @ApiProperty({
        description: 'Header details for Apple Pay encryption',
        type: Object,
        example: { publicKeyHash: 'abc123', transactionId: 'txn_456', ephemeralPublicKey: 'ephemeralKey' },
    })
    @IsObject()
    @IsNotEmpty()
    header: {
        publicKeyHash: string;
        transactionId: string;
        ephemeralPublicKey: string;
    };

    @ApiProperty({ description: 'Cryptographic signature', example: 'signature_string_here' })
    @IsString()
    @IsNotEmpty()
    signature: string;
}