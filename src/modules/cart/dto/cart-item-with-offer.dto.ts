import { Expose, Type } from "class-transformer";
import { SimpleOfferDto } from "src/modules/offer/dto/simple-offer.dto";
import { BaseProductDto } from "src/modules/product/dto/base-product.dto";
import { ProductExtraDto } from "src/modules/product_extra/dto/extra-dto";
import { InstructionDto, ProductInstructionDto } from "src/modules/product_instruction/dto/instruction-dto";
import { ProductVariantDto, VariantDto } from "src/modules/prouduct_variant/dto/variant-dto";

class ProductWithOfferDto extends BaseProductDto {
    @Expose()
    discountedPrice: number;

    @Expose()
    @Type(() => SimpleOfferDto)
    offer?: SimpleOfferDto;
}

export class CartItemWithOfferDto {
    @Expose()
    id: number;

    @Expose()
    note: string;

    @Expose()
    quantity: number;

    @Expose()
    originalPrice: number;

    @Expose()
    finalPrice: number;

    @Expose()
    totalPrice: number;

    @Expose()
    @Type(() => ProductWithOfferDto)
    product: ProductWithOfferDto;

    @Expose()
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto;
    
    @Expose()
    @Type(() => ProductInstructionDto)
    instructions: InstructionDto;

    @Expose()
    @Type(() => ProductExtraDto)
    extras: ProductExtraDto;
}