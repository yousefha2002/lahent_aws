import { Transform, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ProductLanguageDto } from './create-product.dto';

export class UpdateProductWithImageDto {
  @IsString()
  languages: string;

  @IsString()
  @IsNotEmpty()
  basePrice: string;

  @IsString()
  @IsNotEmpty()
  preparationTime: string;

  @IsString()
  existingImages: string; // JSON string from FormData
}
