import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseProductDto } from './base-product.dto';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { ProductInstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { CategoryWithVariantsDto } from 'src/modules/variant_category/dto/category_with_variants.dto';
import { ProductExtraDto } from 'src/modules/product_extra/dto/extra-dto';

export class FullProductDetailsDto extends BaseProductDto {
    @Expose()
    @ApiProperty({ example: 49.99 })
    discountedPrice: number;

    @Expose()
    @Type(() => CategoryWithVariantsDto)
    @ApiProperty({ type: [CategoryWithVariantsDto] })
    variantCategories: CategoryWithVariantsDto[];

    @Expose()
    @Type(() => ProductExtraDto)
    @ApiProperty({ type: [ProductExtraDto] })
    extras: ProductExtraDto[];

    @Expose()
    @Type(() => ProductInstructionDto)
    @ApiProperty({ type: [ProductInstructionDto] })
    instructions: ProductInstructionDto[];

    @Expose()
    @Type(() => SimpleOfferDto)
    @ApiProperty({ type: SimpleOfferDto, nullable: true })
    offer: SimpleOfferDto | null;
}

export class fullProductDetailsWihtPrivateDetails extends FullProductDetailsDto {
    @Expose()
    @ApiProperty({ example: 101 })
    productNumber: number;

    @Expose()
    @ApiProperty({ example: 250 })
    sales: number;

    @Expose()
    @ApiProperty({ example: true })
    isActive: boolean;
}