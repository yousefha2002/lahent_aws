import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Length, Min } from 'class-validator';

export class UpdateProductWithIcategoryDto {
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

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
  @IsNotEmpty()
  @Length(10, 200, { message: 'shortDescription must be between 10 and 200 characters' })
  shortDescription: string;
  
  @IsString()
  @IsNotEmpty()
  @Length(50, 2000, { message: 'longDescription must be between 50 and 2000 characters' })
  longDescription: string;
}
