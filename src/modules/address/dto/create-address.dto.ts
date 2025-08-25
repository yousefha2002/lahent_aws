import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAddressDto {
    @ApiProperty({ example: 'Home' })
    @IsNotEmpty()
    @IsString()
    label: string;

    @ApiProperty({ example: '123 Main St, City, Country' })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({ example: 31.7683 })
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @ApiProperty({ example: 35.2137 })
    @IsNotEmpty()
    @IsNumber()
    lng: number;
}