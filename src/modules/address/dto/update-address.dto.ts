import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AddressLabel } from 'src/common/enums/address_label';

export class UpdateAddressDto {
    @ApiProperty({ example: 'Office', required: false })
    @IsOptional()
    @IsEnum(AddressLabel)
    label?: AddressLabel;

    @ApiProperty({ example: 31.7683, required: false })
    @IsOptional()
    @IsNumber()
    lat?: number;

    @ApiProperty({ example: 35.2137, required: false })
    @IsOptional()
    @IsNumber()
    lng?: number;
}