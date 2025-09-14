import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString,IsIn, IsNotEmpty } from 'class-validator';
import { cities } from 'src/common/constants/cities';

export class UpdateOwnerDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'owner@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({example:"تبوك"})
    @IsString()
    @IsNotEmpty()
    @IsIn(cities, { message: 'City must be one of the allowed cities in Saudi Arabia' })
    city: string;
}