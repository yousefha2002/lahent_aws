import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @ApiProperty({ example: '1', description: 'ID of the category' })
  categoryId: string;

  @IsString()
  @ApiProperty({ example: '100', description: 'Base price of the product' })
  basePrice: string;

  @IsString()
  @ApiProperty({ example: '15', description: 'Preparation time in minutes' })
  preparationTime: string;

  @IsString()
  @ApiProperty({
    example: JSON.stringify([
      { languageCode: 'en', name: 'My Product', shortDescription: 'Short desc', longDescription: 'Long desc' },
      { languageCode: 'ar', name: 'منتجي', shortDescription: 'وصف قصير', longDescription: 'وصف طويل' },
    ]),
    description: 'Product translations in different languages',
  })
  languages: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Upload 1 to 5 product images',
  })
  images: any[];
}