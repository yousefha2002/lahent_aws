import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsMobilePhone,
  IsIn,
  IsInt,
  Min
} from 'class-validator';
import { cities } from 'src/common/constants/cities';

export class CreateStoreDto {
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsNotEmpty()
  @IsMobilePhone()
  phone: string;

  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsNotEmpty()
  @IsMobilePhone()
  phoneLogin: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(cities, { message: 'City must be one of the allowed cities in Saudi Arabia' })
  city: string;

  @IsString()
  @IsNotEmpty()
  commercialRegister: string;

  @IsString()
  @IsNotEmpty()
  taxNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(30, { message: 'Password must be at most 30 characters' })
  password: string;

  @IsString()
  @IsNotEmpty()
  subTypeId: string;

  @IsString()
  @IsNotEmpty()
  lat: string;

  @IsString()
  @IsNotEmpty()
  lng: string;

  @IsNotEmpty()
  in_store: boolean;

  @IsNotEmpty()
  drive_thru: boolean;

  @IsString()
  @IsNotEmpty()
  openingHours: string;

  @IsString()
  @IsNotEmpty()
  translations: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'Preparation time must be an integer' })
  @Min(0, { message: 'Preparation time cannot be negative' })
  preparationTime: number;
}