import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from './simple-offer.dto';

export class OfferProductDto {
    @Expose() id: number;
    @Expose() name: string;
    @Expose() image: string | null;
}

export class OfferCategoryDto {
    @Expose() id: number;
    @Expose() title: string;
}

export class OfferStoreDto {
    @Expose() id:number;
    @Expose() name: string;
    @Expose() logoUrl: string;
    @Expose() city: string;
}

export class OfferResponseDto extends SimpleOfferDto {
    @Expose() name: string;
    @Expose() type: string;
    @Expose() startDate: Date;
    @Expose() endDate: Date;
    @Expose() target: string;
    @Expose() usedCount?: number;

    @Expose()
    @Type(() => OfferStoreDto)
    store?: OfferStoreDto;

    @Expose()
    @Type(() => OfferProductDto)
    products: OfferProductDto[];

    @Expose() moreProducts: number;
    @Expose() totalProducts: number;

    @Expose()
    @Type(() => OfferCategoryDto)
    categories: OfferCategoryDto[];
}

export class PaginatedOfferResponseDto {
    @Expose()
    @Type(() => OfferResponseDto)
    offers: OfferResponseDto[];

    @Expose()
    totalItems:number

    @Expose()
    totalPages:number
}