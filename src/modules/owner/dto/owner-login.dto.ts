import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsMobilePhone } from 'class-validator';

export class LoginOwnerDto {
  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '1234567890' })
  @Transform(({ value }) => value?.replace(/\D/g, '')) 
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;
}
