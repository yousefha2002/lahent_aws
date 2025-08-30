import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from './simple-offer.dto';
import { StoreLanguageDto } from 'src/modules/store/dto/store-language.dto';
import { SimpleCategoryDto } from 'src/modules/category/dto/category.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OfferProductDto {
    @ApiProperty({ example: 1 })
    @Expose() 
    id: number;

    @ApiPropertyOptional({ example: 'https://example.com/product.jpg', nullable: true })
    @Expose() image: string | null;
}

export class OfferStoreDto {
    @ApiProperty({ example: 101 })
    @Expose() id:number;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @Expose() logoUrl: string;

    @ApiProperty({ example: 'Riyadh' })
    @Expose() city: string;

    @ApiProperty({ type: [StoreLanguageDto] })
    @Expose()
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];
}

export class OfferResponseDto extends SimpleOfferDto {
    @ApiProperty({ example: 'Back to School Offer' })
    @Expose() name: string;

    @ApiProperty({ example: '2025-09-01T00:00:00Z', type: String, format: 'date-time' })
    @Expose() startDate: Date;

    @ApiProperty({ example: '2025-09-30T23:59:59Z', type: String, format: 'date-time' })
    @Expose() endDate: Date;

    @ApiProperty({ example: 'PRODUCT' })
    @Expose() target: string;

    @ApiPropertyOptional({ example: 5 })
    @Expose() usedCount?: number;

    @ApiPropertyOptional({ type: OfferStoreDto })
    @Expose()
    @Type(() => OfferStoreDto)
    store?: OfferStoreDto;

    @ApiProperty({ type: [OfferProductDto] })
    @Expose()
    @Type(() => OfferProductDto)
    products: OfferProductDto[];

    @ApiProperty({ example: 2 })
    @Expose() moreProducts: number;

    @ApiProperty({ example: 5 })
    @Expose() totalProducts: number;

    @ApiProperty({ type: [SimpleCategoryDto] })
    @Expose()
    @Type(() => SimpleCategoryDto)
    categories: SimpleCategoryDto[];
}

export class PaginatedOfferResponseDto {
    @ApiProperty({ type: [OfferResponseDto] })
    @Expose()
    @Type(() => OfferResponseDto)
    offers: OfferResponseDto[];

    @ApiProperty({ example: 20 })
    @Expose() totalItems: number;

    @ApiProperty({ example: 4 })
    @Expose() totalPages: number;
}