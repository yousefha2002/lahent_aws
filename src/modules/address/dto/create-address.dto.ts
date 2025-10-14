import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AddressLabel } from 'src/common/enums/address_label';

export class CreateAddressDto {
    @ApiProperty({ example: 'home' })
    @IsNotEmpty()
    @IsEnum(AddressLabel)
    label: AddressLabel;

    @ApiProperty({ example: 31.7683 })
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @ApiProperty({ example: 35.2137 })
    @IsNotEmpty()
    @IsNumber()
    lng: number;
}