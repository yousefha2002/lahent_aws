import { IsInt, IsMobilePhone, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAdminDto {
    @ApiProperty({
        example: 'Mohammed Ali',
        description: 'Full name of the admin',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: '966512345678',
        description: 'Phone number of the admin (9–15 digits)',
    })
    @IsString()
    @IsMobilePhone()
    @Transform(({ value }) => value?.replace(/\D/g, '')) 
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        example: 3,
        description: 'Role ID assigned to the admin',
    })
    @IsInt()
    roleId: number;
}
