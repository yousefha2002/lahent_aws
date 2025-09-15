import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class ProductImageDto {
    @Expose()
    @ApiProperty({ example: 'https://example.com/image1.jpg' })
    imageUrl: string;
}

class ProductNameLanguageDto {
    @Expose()
    @ApiProperty({ example: 'en' })
    languageCode: string;

    @Expose()
    @ApiProperty({ example: 'My Product' })
    name: string;
}

export class TopProductResponseDto {
    @Expose()
    @ApiProperty({ example: 1, description: 'Product ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: 120, description: 'Number of sales' })
    totalSold: number;

    @Expose()
    @ApiProperty({ type: [ProductNameLanguageDto], description: 'Product names by language' })
    @Type(() => ProductNameLanguageDto)
    languages: ProductNameLanguageDto[];

    @Expose()
    @ApiProperty({ type: [ProductImageDto], description: 'Product images' })
    @Type(() => ProductImageDto)
    images: ProductImageDto[];
}
