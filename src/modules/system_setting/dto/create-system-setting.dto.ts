import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemSettingDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country: string;
}