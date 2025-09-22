import { IsNotEmpty, IsString, Length, IsDate, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentCardDto {
    @ApiProperty({ example: '12345678123456', description: 'Card number, 14 digits' })
    @IsString()
    @Length(14, 14)
    cardNumber: string;

    @ApiProperty({ example: '2026-09-01T00:00:00.000Z', description: 'Expiry date' })
    @Type(() => Date)
    @IsDate()
    expiryDate: Date;

    @ApiProperty({ example: 'John Doe', description: 'Card holder name' })
    @IsString()
    cardHolderName: string;

    @ApiPropertyOptional({ example: true, description: 'Make this card default' })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}