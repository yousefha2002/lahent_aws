import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {IsArray,IsNotEmpty,IsString,ValidateNested} from 'class-validator';
import { Language } from 'src/common/enums/language';

class CarBrandLanguageDto {
  @ApiProperty()
  @IsNotEmpty()
  languageCode: Language;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCarBrandDto {
  @ApiProperty({type:[CarBrandLanguageDto]})
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarBrandLanguageDto)
  languages: CarBrandLanguageDto[];
}