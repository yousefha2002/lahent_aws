import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from './simple-offer.dto';
import { StoreLanguageDto } from 'src/modules/store/dto/store-language.dto';
import { SimpleCategoryDto } from 'src/modules/category/dto/category.dto';

export class OfferProductDto {
    @Expose() id: number;
    @Expose() image: string | null;
}

export class OfferStoreDto {
    @Expose() id:number;
    @Expose() logoUrl: string;
    @Expose() city: string;
    @Expose()
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];
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
    @Type(() => SimpleCategoryDto)
    categories: SimpleCategoryDto[];
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