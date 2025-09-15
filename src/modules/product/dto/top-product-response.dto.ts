import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class ProductImageDto {
    @Expose()
    @ApiProperty({ example: 'https://example.com/image1.jpg' })
    imageUrl: string;
}

export class TopProductResponseDto {
    @Expose()
    @ApiProperty({ example: 1, description: 'Product ID' })
    id: number;

    @Expose()
    @ApiProperty({ example: 'My Product', description: 'Product name in requested language' })
    name: string;

    @Expose()
    @ApiProperty({ type: [ProductImageDto], description: 'Product images' })
    @Type(() => ProductImageDto)
    images: ProductImageDto[];

    @Expose()
    @ApiProperty({ example: 120, description: 'Number of sales' })
    sales: number;
}
