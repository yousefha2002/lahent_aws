import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({
        description: 'Refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;

    @ApiProperty({
        description: 'Unique device identifier (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    deviceId: string;
}