import { Expose, Type } from 'class-transformer';
import { BaseProductDto } from './base-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductForStoreDto extends BaseProductDto {
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

export class PaginatedSimpleProductDto {
    @ApiProperty({ type: [ProductForStoreDto] })
    @Expose()
    @Type(() => ProductForStoreDto)
    data: ProductForStoreDto[];

    @ApiProperty({example:10})
    @Expose()
    totalPages: number;

    @ApiProperty({example:100})
    @Expose()
    totalItems: number;
}