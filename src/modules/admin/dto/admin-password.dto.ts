import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminPasswordDto {
    @ApiProperty({example:"123456"})
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 مفاطع' })
    @MaxLength(20, { message: 'كلمة المرور يجب أن تكون على الأكثر 20 مفاطع' })
    newPassword: string;

    @ApiProperty({example:"12345"})
    @IsString()
    @IsNotEmpty()
    oldPassword: string;
}
