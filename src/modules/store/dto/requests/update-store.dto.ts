import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsMobilePhone,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ActionOpeningHourDto } from 'src/modules/opening_hour/dto/action-open-hour.dto';
import { cities } from 'src/common/constants/cities';
import { ApiProperty } from '@nestjs/swagger';
import { StoreLanguageActionDto } from './store-language-action.dto';

export class UpdateStoreDto {
  @ApiProperty({ example: '0501234567', required: false })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsOptional()
  @IsMobilePhone()
  phone?: string;

  @ApiProperty({ example: '0501234567', required: false })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @IsOptional()
  @IsMobilePhone()
  phoneLogin?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  inStore?: boolean;

  @ApiProperty({ example: 'الرياض', required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @IsIn(cities, { message: 'City must be one of the allowed cities in Saudi Arabia' })
  city: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  subTypeId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  sectorId?: number;

  @ApiProperty({ example: 24.7136, required: false })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ example: 46.6753, required: false })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  driveThru?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  commercialRegister?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiProperty({ type: [ActionOpeningHourDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionOpeningHourDto)
  openingHours?: ActionOpeningHourDto[];

  @ApiProperty({ type: [StoreLanguageActionDto] })
  @IsOptional()
  @IsArray()
  @Type(() => StoreLanguageActionDto)
  languages?: StoreLanguageActionDto[];
}
