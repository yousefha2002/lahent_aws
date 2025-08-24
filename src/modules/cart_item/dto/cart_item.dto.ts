import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from 'src/modules/product/dto/base-product.dto';
import { ProductExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { InstructionDto, ProductInstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { ProductVariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';
import { CategoryWithVariantsDto } from 'src/modules/variant_category/dto/category_with_variants.dto';

export class ProductExtraWithSelectedDto extends ProductExtraDto {
    @Expose() selected: boolean;
}

export class ProductVariantWithSelectedDto extends ProductVariantDto{
    @Expose() selected: boolean;
}

export class CategoryWithVariantsWithSelectedDto extends CategoryWithVariantsDto {
    @Expose()
    @Type(() => ProductVariantWithSelectedDto)
    variants: ProductVariantWithSelectedDto[];
}

export class ProductInstructionWithSelectedDto extends ProductInstructionDto {
    @Expose() selected: boolean;
}

export class CartItemProductDto extends BaseProductDto {
    @Expose() discountedPrice: number;

    @Expose()
    @Type(() => SimpleOfferDto)
    offer: SimpleOfferDto | null;
}

export class CartItemWithProductOptionsDto {
    @Expose() cartItemId: number;
    @Expose() quantity: number;
    @Expose() originalPrice: number;
    @Expose() finalPrice: number;
    @Expose() totalPirce: number;
    @Expose() note: string;

    @Expose()
    @Type(() => CartItemProductDto)
    product: CartItemProductDto;

    @Expose()
    @Type(() => ProductExtraWithSelectedDto)
    extras: ProductExtraWithSelectedDto[];

    @Expose()
    @Type(() => CategoryWithVariantsWithSelectedDto)
    variantCategories: CategoryWithVariantsWithSelectedDto[];

    @Expose()
    @Type(() => ProductInstructionWithSelectedDto)
    instructions: ProductInstructionWithSelectedDto[];
}