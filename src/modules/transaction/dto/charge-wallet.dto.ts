import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty,IsInt,IsString, IsOptional } from "class-validator";
import { GatewayType } from "src/common/enums/gatewat_type";
import { CreatePaymentCardWithSaveDto } from "src/modules/payment_card/dto/create-payment-card.dto";

export class ChargeWalletDTO {
    @IsEnum(GatewayType, { message: 'gateway must be a valid GatewayType' })
    @IsNotEmpty()
    gateway:GatewayType

    @ApiPropertyOptional({ description: 'Existing payment card ID' })
    @IsInt()
    @IsOptional()
    paymentCardId: number;

    @ApiProperty({ description: 'CCV of the card' })
    @IsString()
    @IsNotEmpty()
    cvc: string;

    @ApiPropertyOptional({ description: 'New card details if adding a new card', type: CreatePaymentCardWithSaveDto })
    @IsOptional()
    newCard?: CreatePaymentCardWithSaveDto;
}