import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail, IsMobilePhone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOwnerDto {
  @ApiProperty({ example: 'owner@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '1234567890' })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsMobilePhone()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'xyz-client-token' })
  @IsNotEmpty()
  @IsString()
  token: string;
}