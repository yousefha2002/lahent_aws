import {IsNotEmpty, IsString } from 'class-validator';

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
