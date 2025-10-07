import {Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProductVariantLanguageDto } from './variant-dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SingleVariantDto {
  @IsNumber()
  @IsNotEmpty()
  additionalPrice: number;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantLanguageDto)
  languages: ProductVariantLanguageDto[];
}

export class CreateProductVariantsDto {
  @ApiProperty({ example: '1', description: 'ID of the product' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    type: String,
    description: 'JSON string of variants array',
    example: JSON.stringify([
      {
        additionalPrice: 10,
        categoryId: 2,
        languages: [
          { languageCode: 'en', name: 'Small' },
          { languageCode: 'ar', name: 'صغير' },
        ],
      },
    ]),
  })
  @IsString()
  variants: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Upload a new image for the variant (optional)' })
  @IsOptional()
  image_0?: any;
}
