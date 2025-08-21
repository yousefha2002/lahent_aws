import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from './base-product.dto';

export class ProductWithOfferDto extends BaseProductDto {
    @Expose()
    @Type(() => SimpleOfferDto)
    offer: SimpleOfferDto | null;
}

export class PaginatedProductWithOfferDto {
    @Expose()
    @Type(() => ProductWithOfferDto)
    data: ProductWithOfferDto[];

    @Expose()
    totalPages: number;

    @Expose()
    totalItems: number;
}