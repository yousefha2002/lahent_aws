import { Expose, Type } from 'class-transformer';
import { BaseProductDto } from './base-product.dto';

export class ProductForStoreDto extends BaseProductDto {
    @Expose()
    isActive: boolean;

    @Expose()
    product_number:number

    @Expose()
    sales:number
}

export class PaginatedSimpleProductDto {
    @Expose()
    @Type(() => ProductForStoreDto)
    data: ProductForStoreDto[];

    @Expose()
    totalPages: number;

    @Expose()
    totalItems: number;
}