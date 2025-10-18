import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Language } from 'src/common/enums/language';

class BasicSubTypeLanguageDto {
  @ApiProperty()
  @IsNotEmpty()
  languageCode: Language;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateSubTypeDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  typeId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasicSubTypeLanguageDto)
  @ApiProperty({ type: [BasicSubTypeLanguageDto] })
  languages: BasicSubTypeLanguageDto[];
}

export class UpdateSubTypeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasicSubTypeLanguageDto)
  @ApiProperty({ type: [BasicSubTypeLanguageDto] })
  languages: BasicSubTypeLanguageDto[];
}