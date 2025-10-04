import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsNotEmpty } from "class-validator";
import { CreatePaymentCardWithSaveDto } from "src/modules/payment_card/dto/create-payment-card.dto";

export class PayOrderDTO {
    @ApiPropertyOptional({ description: 'Existing payment card ID for gateway payment' })
    @IsInt()
    @IsOptional()
    paymentCardId?: number;

    @ApiPropertyOptional({ description: 'CVC of the card if using saved card' })
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    cvc?: string;

    @ApiPropertyOptional({ description: 'New card details if adding a new card', type: CreatePaymentCardWithSaveDto })
    @IsOptional()
    newCard?: CreatePaymentCardWithSaveDto;
}