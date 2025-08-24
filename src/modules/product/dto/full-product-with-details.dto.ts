import { Expose, Type } from 'class-transformer';
import { BaseProductDto } from './base-product.dto';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { ProductInstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { CategoryWithVariantsDto } from 'src/modules/variant_category/dto/category_with_variants.dto';
import { ProductExtraDto } from 'src/modules/product_extra/dto/extra-dto';

export class FullProductDetailsDto extends BaseProductDto {
    @Expose()
    product_number: number;

    @Expose()
    sales: number;

    @Expose()
    finalPrice: number;

    @Expose()
    @Type(() => CategoryWithVariantsDto)
    variantCategories: CategoryWithVariantsDto[];

    @Expose()
    @Type(() => ProductExtraDto)
    extras: ProductExtraDto[];

    @Expose()
    @Type(() => ProductInstructionDto)
    instructions: ProductInstructionDto[];

    @Expose()
    @Type(() => SimpleOfferDto)
    offer: SimpleOfferDto | null;
}