import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
    @ApiProperty({ example: 'Office', required: false })
    @IsOptional()
    @IsString()
    label?: string;

    @ApiProperty({ example: 31.7683, required: false })
    @IsOptional()
    @IsNumber()
    lat?: number;

    @ApiProperty({ example: 35.2137, required: false })
    @IsOptional()
    @IsNumber()
    lng?: number;
}