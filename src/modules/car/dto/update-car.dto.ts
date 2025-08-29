import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCarDto {
  @ApiProperty({ example: 'My Car' })
  @IsString()
  carName: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  carTypeId: number;

  @ApiProperty({ example: '#333333' })
  @IsString()
  color: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  brandId: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  modelId: number;

  @ApiProperty({ example: '1234', required: false })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiProperty({ example: 'AB', required: false })
  @IsOptional()
  @IsString()
  plateLetters?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}