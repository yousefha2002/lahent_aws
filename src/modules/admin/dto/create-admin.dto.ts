import { IsInt, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    @Matches(/^\d{9,15}$/, { message: 'Phone must be a valid number' })
    phone: string;

    @ApiProperty({
        example: 3,
        description: 'Role ID assigned to the admin',
    })
    @IsInt()
    roleId: number;
}
