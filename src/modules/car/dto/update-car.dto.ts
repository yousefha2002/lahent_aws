import { IsOptional, IsString, IsBoolean, IsInt } from 'class-validator';

export class UpdateCarDto {
  @IsString()
  carName: string;

  @IsInt()
  carTypeId: number;

  @IsString()
  color: string;

  @IsInt()
  brandId: number;

  @IsInt()
  modelId: number;

  @IsOptional()
  @IsString()
  plateNumber: string;

  @IsOptional()
  @IsString()
  plateLetters: string;

  @IsOptional()
  @IsBoolean()
  isDefault: boolean;
}