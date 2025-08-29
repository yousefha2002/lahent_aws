import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsNotEmpty, Min, IsOptional, ValidateNested } from 'class-validator';
import { ProductExtraLanguageDto } from './extra-dto';

export class UpdateProductExtraDto {
  @ApiProperty({ example: 10, description: 'Product ID for which the extra belongs' })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiPropertyOptional({ example: 5.5, description: 'Additional price for this extra' })
  @IsNumber()
  @IsOptional()
  additional_price?: number;

  @ApiPropertyOptional({
    type: [ProductExtraLanguageDto],
    description: 'Localized names/descriptions for the extra',
    example: [
      { language: 'en', name: 'Extra Cheese' },
      { language: 'ar', name: 'جبنة إضافية' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductExtraLanguageDto)
  @IsOptional()
  languages?: ProductExtraLanguageDto[];
}