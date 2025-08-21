import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    avatarId?: string;
}