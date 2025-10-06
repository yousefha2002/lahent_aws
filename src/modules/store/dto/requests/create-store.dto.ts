import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {IsNotEmpty,IsString,MaxLength,MinLength,IsMobilePhone,IsIn} from 'class-validator';
import { cities } from 'src/common/constants/cities';

export class CreateStoreDto {
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsNotEmpty()
  @IsMobilePhone()
  @ApiProperty({ example: '0501234567' })
  phone: string;

  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsNotEmpty()
  @IsMobilePhone()
  @ApiProperty({ example: '0501234567' })
  phoneLogin: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(cities, { message: 'City must be one of the allowed cities in Saudi Arabia' })
  @ApiProperty({ example: 'الرياض' })
  city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234567890' })
  commercialRegister: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1234567890' })
  taxNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(30, { message: 'Password must be at most 30 characters' })
  @ApiProperty({ example: '123456' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1' })
  subTypeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '24.7136' })
  lat: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '46.6753' })
  lng: string;

  @IsNotEmpty()
  @ApiProperty({ example: true })
  inStore: boolean;

  @IsNotEmpty()
  @ApiProperty({ example: false })
  driveThru: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: JSON.stringify([
      { day: 'mon', openTime: '08:00', closeTime: '18:00' },
      { day: 'tue', openTime: '08:00', closeTime: '18:00' },
    ]),
  })
  openingHours: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: JSON.stringify([
      { languageCode: 'en', name: 'My Store' },
      { languageCode: 'ar', name: 'متجري' },
    ]),
  })
  translations: string;

  // ملفات
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  logo?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  cover?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  commercialRegisterFile?: any;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  taxNumberFile?: any;
}