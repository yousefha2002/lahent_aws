import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from 'src/modules/product/dto/base-product.dto';
import { ExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { InstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { VariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';

export class ProductExtraWithSelectedDto extends ExtraDto {
    @Expose() selected: boolean;
}

export class ProductVariantWithSelectedDto extends VariantDto{
    @Expose() selected: boolean;
}

export class ProductInstructionWithSelectedDto extends InstructionDto {
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

    @Expose()
    @Type(() => CartItemProductDto)
    product: CartItemProductDto;

    @Expose()
    @Type(() => ProductExtraWithSelectedDto)
    extras: ProductExtraWithSelectedDto[];

    @Expose()
    @Type(() => ProductVariantWithSelectedDto)
    variants: ProductVariantWithSelectedDto[];

    @Expose()
    @Type(() => ProductInstructionWithSelectedDto)
    instructions: ProductInstructionWithSelectedDto[];
}