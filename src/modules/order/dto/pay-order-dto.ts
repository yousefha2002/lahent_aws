import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, IsNotEmpty } from "class-validator";

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
}