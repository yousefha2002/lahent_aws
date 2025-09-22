import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty,IsInt,IsString } from "class-validator";
import { GatewayType } from "src/common/enums/gatewat_type";

export class ChargeWalletDTO {
    @IsEnum(GatewayType, { message: 'gateway must be a valid GatewayType' })
    @IsNotEmpty()
    gateway:GatewayType

    @ApiProperty({ description: 'Existing payment card ID' })
    @IsInt()
    paymentCardId: number;

    @ApiProperty({ description: 'CCV of the card' })
    @IsString()
    @IsNotEmpty()
    cvc: string;
}