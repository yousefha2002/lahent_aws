import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsMobilePhone,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ActionOpeningHourDto } from 'src/modules/opening_hour/dto/action-open-hour.dto';
import { cities } from 'src/common/constants/cities';
import { StoreLanguageActionDto } from './store-language-action.dto';

export class UpdateStoreDto {
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsOptional()
  @IsMobilePhone()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  in_store?: boolean;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn(cities, { message: 'City must be one of the allowed cities in Saudi Arabia' })
  city: string;

  @IsOptional()
  @IsBoolean()
  drive_thru?: boolean;

  @IsOptional()
  @IsString()
  commercialRegister?: string;

  @IsOptional()
  @IsString()
  taxNumber?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionOpeningHourDto)
  openingHours?: ActionOpeningHourDto[];

  @IsOptional()
  @IsArray()
  @Type(() => StoreLanguageActionDto)
  languages?: StoreLanguageActionDto[];
}
