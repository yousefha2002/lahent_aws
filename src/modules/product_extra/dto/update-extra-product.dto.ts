import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsNotEmpty, Min, IsOptional, ValidateNested } from 'class-validator';
import { ProductExtraLanguageDto } from './extra-dto';

export class UpdateProductExtraDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsOptional()
  additional_price?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductExtraLanguageDto)
  @IsOptional()
  languages?: ProductExtraLanguageDto[];
}