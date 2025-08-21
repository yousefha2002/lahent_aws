import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @Length(4, 4, { message: 'Code must be exactly 4 digits' })
    code: string;
}