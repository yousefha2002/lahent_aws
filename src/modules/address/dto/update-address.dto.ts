import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsNumber()
    lat?: number;

    @IsOptional()
    @IsNumber()
    lng?: number;
}