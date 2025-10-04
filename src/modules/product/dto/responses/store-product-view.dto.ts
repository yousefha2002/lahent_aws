import { Expose, Type } from 'class-transformer';
import { BaseProductDto } from './base-product.dto';
import { ApiProperty } from '@nestjs/swagger';

class ProductStoreDetailsDto extends BaseProductDto {
    @ApiProperty({example:true})
    @Expose()
    isActive: boolean;

    @ApiProperty({example:222})
    @Expose()
    productNumber:number

    @ApiProperty({example:6})
    @Expose()
    sales:number
}

export class PaginatedProductsStoreViewDto {
    @ApiProperty({ type: [ProductStoreDetailsDto] })
    @Expose()
    @Type(() => ProductStoreDetailsDto)
    data: ProductStoreDetailsDto[];

    @ApiProperty({example:10})
    @Expose()
    totalPages: number;

    @ApiProperty({example:100})
    @Expose()
    totalItems: number;
}