import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from './base-product.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ProductWithOfferDto extends BaseProductDto {
    @ApiProperty({ example: 25 })
    @Expose() 
    discountedPrice: number;

    @ApiProperty({ type: SimpleOfferDto, nullable: true })
    @Expose()
    @Type(() => SimpleOfferDto)
    offer: SimpleOfferDto | null;
}

export class PaginatedProductWithOfferDto {
    @ApiProperty({ type: [ProductWithOfferDto] })
    @Expose()
    @Type(() => ProductWithOfferDto)
    data: ProductWithOfferDto[];

    @ApiProperty({ example: 5 })
    @Expose()
    totalPages: number;

    @ApiProperty({ example: 50 })
    @Expose()
    totalItems: number;
}