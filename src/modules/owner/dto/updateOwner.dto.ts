import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateOwnerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}