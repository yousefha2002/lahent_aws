import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SystemSettingDto {
    @Expose()
    @ApiProperty()
    phoneNumber: string;

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiProperty()
    country: string; 
}