import { IsNotEmpty, IsString, Length, IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentCardDto {
    @ApiProperty({ example: '12345678123456', description: 'Card number, 14 digits' })
    @IsString()
    @Length(14, 14)
    cardNumber: string;

    @ApiProperty({ example: '2026-09', description: 'Expiry date in YYYY-MM format' })
    @IsString()
    @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Expiry date must be in format YYYY-MM' })
    expiryDate: string;

    @ApiProperty({ example: 'John Doe', description: 'Card holder name' })
    @IsString()
    cardHolderName: string;

    @ApiProperty({ example: 'Card Name', description: 'Card name' })
    @IsString()
    @IsNotEmpty()
    cardName: string;

    @ApiPropertyOptional({ example: true, description: 'Make this card default' })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}

export class CreatePaymentCardWithSaveDto extends CreatePaymentCardDto {
    @ApiProperty({ example: true, description: 'Save this Cart' })
    @IsBoolean()
    isSave: boolean;
}