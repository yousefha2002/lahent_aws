import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
    @ApiProperty({ example: '970599999999', description: 'Phone number to verify' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: '1234', description: '4-digit OTP code' })
    @IsString()
    @Length(4, 4, { message: 'Code must be exactly 4 digits' })
    code: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsString()
    @IsNotEmpty()
    deviceId: string;
}