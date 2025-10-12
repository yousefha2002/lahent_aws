import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsEnum } from 'class-validator';
import { GatewayType } from 'src/common/enums/gateway_type';
import { ApplePayPaymentDTO } from 'src/modules/payment_session/dto/apple-payment.dto';
import { Expose } from "class-transformer";

export class ChargeWalletApplePayDTO {
    @ApiProperty({example:GatewayType.edfapay})
    @IsEnum(GatewayType, { message: 'gateway must be a valid GatewayType' })
    @IsNotEmpty()
    gateway:GatewayType

    @ApiProperty({ type: ApplePayPaymentDTO, description: 'Apple Pay payment details' })
    @IsNotEmpty()
    applePayPayment: ApplePayPaymentDTO;
}

export class ApplePayResponseDto {
    @Expose()
    @ApiProperty({example:'Wallet charged successfully via Apple Pay'})
    message: string;

    @Expose()
    @ApiProperty({example:true})
    success: boolean;
}