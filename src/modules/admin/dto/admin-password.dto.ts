import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminPasswordDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 مفاطع' })
    @MaxLength(20, { message: 'كلمة المرور يجب أن تكون على الأكثر 20 مفاطع' })
    newPassword: string;

    @IsString()
    @IsNotEmpty()
    oldPassword: string;
}
