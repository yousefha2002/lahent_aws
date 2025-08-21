import { IsEmail, IsNotEmpty } from 'class-validator';

export class AdminEmailDto {
    @IsEmail()
    @IsNotEmpty()
    newEmail: string;
}
