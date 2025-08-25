import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RecentAddressDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: '123 Main St, City, Country' })
    @Expose()
    address: string;

    @ApiProperty({ example: 31.7683 })
    @Expose()
    lat: number;

    @ApiProperty({ example: 35.2137 })
    @Expose()
    lng: number;
}