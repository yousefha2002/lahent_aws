import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from './base-product.dto';
import { ApiProperty } from '@nestjs/swagger';

class ProductCustomerDetailsDto extends BaseProductDto {
    @ApiProperty({ example: true })
    @Expose() 
    hasVariants: boolean;
    
    @ApiProperty({ example: 25 })
    @Expose() 
    discountedPrice: number;

    @ApiProperty({ type: SimpleOfferDto, nullable: true })
    @Expose()
    @Type(() => SimpleOfferDto)
    offer: SimpleOfferDto | null;
}

export class PaginatedProductsCustomerViewDto {
    @ApiProperty({ type: [ProductCustomerDetailsDto] })
    @Expose()
    @Type(() => ProductCustomerDetailsDto)
    data: ProductCustomerDetailsDto[];

    @ApiProperty({ example: 5 })
    @Expose()
    totalPages: number;

    @ApiProperty({ example: 50 })
    @Expose()
    totalItems: number;
}