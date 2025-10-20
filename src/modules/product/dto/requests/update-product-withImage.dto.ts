import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductWithImageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Product translations in different languages',
    example: JSON.stringify([
      { languageCode: 'en', name: 'Updated Product', shortDescription: 'New short desc', longDescription: 'New long desc' },
      { languageCode: 'ar', name: 'المنتج المحدّث', shortDescription: 'وصف قصير جديد', longDescription: 'وصف طويل جديد' },
    ]),
  })
  languages: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '120', description: 'Updated base price of the product' })
  basePrice: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '20', description: 'Updated preparation time in minutes' })
  preparationTime: string;

  @IsString()
  @ApiProperty({
    example: JSON.stringify("uploads/bpaayhvhetsszkxwritd"),
    description: 'JSON array of existing image IDs to keep',
  })
  existingImages: string;
}