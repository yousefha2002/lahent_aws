import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AddressLabel } from 'src/common/enums/address_label';

export class AddressDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 'Home' })
    @Expose()
    label: AddressLabel;

    @ApiProperty({ example: 31.7683 })
    @Expose()
    lat: number;

    @ApiProperty({ example: 35.2137 })
    @Expose()
    lng: number;
}