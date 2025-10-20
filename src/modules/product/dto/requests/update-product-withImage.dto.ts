import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProductWithImageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Product translations in different languages',
    example: JSON.stringify([
      { languageCode: 'en', name: 'Updated Product', shortDescription: 'New short desc', longDescription: 'New long desc' },
      { languageCode: 'ar', name: 'المنتج المحدّث', shortDescription: 'وصف قصير جديد', longDescription: 'وصف طويل جديد' },
    ]),
  })
  languages?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ example: '120', description: 'Updated base price of the product' })
  basePrice?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ example: '20', description: 'Updated preparation time in minutes' })
  preparationTime?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: JSON.stringify("uploads/bpaayhvhetsszkxwritd"),
    description: 'JSON array of existing image IDs to keep',
  })
  existingImages?: string;
}