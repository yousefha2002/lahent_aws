import {Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ProductVariantLanguageDto } from './variant-dto';

export class SingleVariantDto {
  @IsNumber()
  @IsNotEmpty()
  additionalPrice: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantLanguageDto)
  languages: ProductVariantLanguageDto[];
}

export class CreateProductVariantsDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  variants: string
}
