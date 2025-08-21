import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class authAdminDto {
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صالح' })
  email: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصًا' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون على الأقل 8 مفاطع' })
  @MaxLength(20, { message: 'كلمة المرور يجب أن تكون على الأكثر 20 مفاطع' })
  password: string;
}
