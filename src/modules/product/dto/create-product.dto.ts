import {IsString } from 'class-validator';

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