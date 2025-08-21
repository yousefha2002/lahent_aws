import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsMobilePhone } from 'class-validator';

export class LoginOwnerDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @Transform(({ value }) => value?.replace(/\D/g, '')) 
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;
}
