import { ApiProperty } from '@nestjs/swagger';
import { Expose, } from 'class-transformer';

export class SimpleAdminDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Yousef' })
    name: string;

    @Expose()
    @ApiProperty({ example: '966500000000' })
    phone: string;

    @Expose()
    @ApiProperty({ example: true })
    active: boolean;
}
