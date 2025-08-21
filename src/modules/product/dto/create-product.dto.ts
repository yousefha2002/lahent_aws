import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  Length
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  storeId: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 200, { message: 'shortDescription must be between 10 and 200 characters' })
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Length(50, 2000, { message: 'longDescription must be between 50 and 2000 characters' })
  longDescription: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'preparationTime must be an integer number' })
  @Min(0, { message: 'preparationTime must be a positive number' })
  @IsNotEmpty()
  preparationTime: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt({ message: 'basePrice must be an integer number' })
  @Min(0, { message: 'basePrice must be a positive number' })
  @IsNotEmpty()
  basePrice: number;

  @IsString()
  @IsOptional()
  extraItems?: string; // JSON string from FormData

  @IsString()
  @IsOptional()
  variants?: string; // JSON string from FormData

  @Transform(({ value }) => {
    try {
      if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specialChanges?: string[];
}
