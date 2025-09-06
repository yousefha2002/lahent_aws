import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCarDto {
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(20, { message: 'Name must be at most 20 characters' })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({minLength: 3, maxLength: 20, example: 'My Car' })
  carName: string;

  @ApiPropertyOptional({ description: 'Whether to save the car in list', example: true })
  @IsBoolean()
  @IsOptional()
  isSave:boolean

  @ApiProperty({ description: 'Car type ID (1-9)', example: 1 })
  @Min(1, { message: 'Car type must be at least 1' })
  @Max(9, { message: 'Car type must be at most 9' })
  @IsNotEmpty()
  carType: number;

  @ApiProperty({ description: 'Color of the car', example: '#333' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ description: 'Brand ID of the car', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  brandId: number;

  @ApiPropertyOptional({ description: 'Plate number of the car', example: '1234' })
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiPropertyOptional({ description: 'Plate letters of the car', example: 'AB' })
  @IsString()
  @IsOptional()
  plateLetters?: string;

  @ApiPropertyOptional({ description: 'Set this car as default', example: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}