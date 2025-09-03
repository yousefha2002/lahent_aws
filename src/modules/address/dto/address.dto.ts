import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 'Home' })
    @Expose()
    label: string;

    @ApiProperty({ example: 31.7683 })
    @Expose()
    lat: number;

    @ApiProperty({ example: 35.2137 })
    @Expose()
    lng: number;
}