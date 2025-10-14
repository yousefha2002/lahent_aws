import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdminDto {
    @ApiPropertyOptional({ example: 'Yousef Ahmed', description: 'Admin name' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: '966512345678', description: 'Phone number (9–15 digits)' })
    @IsString()
    @Matches(/^\d{9,15}$/, { message: 'Phone must be a valid number' })
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 2, description: 'Role ID of the admin' })
    @IsInt()
    @IsOptional()
    roleId?: number;
}