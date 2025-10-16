import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Language } from 'src/common/enums/language';

class SubTypeLanguageDto {
  @ApiProperty()
  @IsNotEmpty()
  languageCode: Language;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateSubTypeDto {
  @IsNumber()
  @IsNotEmpty()
  typeId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubTypeLanguageDto)
  @ApiProperty({ type: [SubTypeLanguageDto] })
  languages: SubTypeLanguageDto[];
}