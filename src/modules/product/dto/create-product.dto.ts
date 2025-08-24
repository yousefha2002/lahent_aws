import { Transform } from 'class-transformer';
import { IsArray, IsString, IsNotEmpty, ValidateNested, IsIn, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from 'src/common/enums/language';

export class ProductLanguageDto {
  @IsString()
  @IsEnum(Language)
  languageCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  longDescription: string;
}

export class CreateProductDto {
  @IsString()
  categoryId: string;

  @IsString()
  basePrice: string;

  @IsString()
  preparationTime: string;

  @IsString()
  languages: string;
}