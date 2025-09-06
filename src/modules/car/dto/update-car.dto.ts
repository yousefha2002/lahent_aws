import { IsOptional, IsString, IsBoolean, IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCarDto {
  @ApiProperty({ example: 'My Car' })
  @IsString()
  carName: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1, { message: 'Car type must be at least 1' })
  @Max(9, { message: 'Car type must be at most 9' })
  carType: number;

  @ApiProperty({ example: '#333333' })
  @IsString()
  color: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  brandId: number;


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