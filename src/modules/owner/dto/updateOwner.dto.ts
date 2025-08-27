import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateOwnerDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'owner@example.com' })
    @IsEmail()
    email: string;
}