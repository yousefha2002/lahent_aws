import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsMobilePhone } from 'class-validator';

export class LoginStoreDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '966501234567' })
  @Transform(({ value }) => value?.replace(/\D/g, '')) 
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;
}
