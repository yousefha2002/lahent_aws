import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class ApplePayPaymentDTO {
    @IsString()
    @IsNotEmpty()
    transactionIdentifier: string;

    @IsObject()
    @IsNotEmpty()
    paymentMethod: {
        network: string;
        type: string;
        displayName: string;
    };

    @IsString()
    @IsNotEmpty()
    version: string;

    @IsString()
    @IsNotEmpty()
    data: string;

    @IsObject()
    @IsNotEmpty()
    header: {
        publicKeyHash: string;
        transactionId: string;
        ephemeralPublicKey: string;
    };

    @IsString()
    @IsNotEmpty()
    signature: string;
}
