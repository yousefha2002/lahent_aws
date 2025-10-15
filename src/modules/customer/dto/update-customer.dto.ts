import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
    @ApiPropertyOptional({example:"Yousef"})
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsOptional()
    name: string;

    @ApiPropertyOptional({example:"yousef@gmail.com"})
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiPropertyOptional({example:1})
    @IsOptional()
    avatarId?: string | number;
}