import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AdminEmailDto {
    @ApiProperty({example:"admin@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    newEmail: string;
}
