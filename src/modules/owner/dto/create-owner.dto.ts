import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail, IsMobilePhone } from 'class-validator';

export class CreateOwnerDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @Transform(({ value }) => value?.replace(/\D/g, '')) 
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
