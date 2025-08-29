import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from 'src/modules/product/dto/base-product.dto';
import { ProductExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { ProductInstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { ProductVariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';
import { CategoryWithVariantsDto } from 'src/modules/variant_category/dto/category_with_variants.dto';

export class ProductExtraWithSelectedDto extends ProductExtraDto {
    @Expose()
    @ApiProperty({ description: 'Indicates if the extra is selected', example: true })
    selected: boolean;
}

export class ProductVariantWithSelectedDto extends ProductVariantDto {
    @Expose()
    @ApiProperty({ description: 'Indicates if the variant is selected', example: true })
    selected: boolean;
}

export class CategoryWithVariantsWithSelectedDto extends CategoryWithVariantsDto {
    @Expose()
    @Type(() => ProductVariantWithSelectedDto)
    @ApiProperty({ type: [ProductVariantWithSelectedDto] })
    variants: ProductVariantWithSelectedDto[];
    }

    export class ProductInstructionWithSelectedDto extends ProductInstructionDto {
    @Expose()
    @ApiProperty({ description: 'Indicates if the instruction is selected', example: true })
    selected: boolean;
}

export class CartItemProductDto extends BaseProductDto {
    @Expose()
    @ApiProperty({ description: 'Discounted price for the product', example: 50 })
    discountedPrice: number;

    @Expose()
    @Type(() => SimpleOfferDto)
    @ApiProperty({ type: SimpleOfferDto, nullable: true })
    offer: SimpleOfferDto | null;
}

export class CartItemWithProductOptionsDto {
    @Expose()
    @ApiProperty({ description: 'Cart item ID', example: 1 })
    cartItemId: number;

    @Expose()
    @ApiProperty({ description: 'Quantity of the item', example: 2 })
    quantity: number;

    @Expose()
    @ApiProperty({ description: 'Original price', example: 100 })
    originalPrice: number;

    @Expose()
    @ApiProperty({ description: 'Final price after discounts', example: 80 })
    finalPrice: number;

    @Expose()
    @ApiProperty({ description: 'Total price for this cart item', example: 160 })
    totalPirce: number;

    @Expose()
    @ApiProperty({ description: 'Customer note', example: 'No onions' })
    note: string;

    @Expose()
    @Type(() => CartItemProductDto)
    @ApiProperty({ type: CartItemProductDto })
    product: CartItemProductDto;

    @Expose()
    @Type(() => ProductExtraWithSelectedDto)
    @ApiProperty({ type: [ProductExtraWithSelectedDto] })
    extras: ProductExtraWithSelectedDto[];

    @Expose()
    @Type(() => CategoryWithVariantsWithSelectedDto)
    @ApiProperty({ type: [CategoryWithVariantsWithSelectedDto] })
    variantCategories: CategoryWithVariantsWithSelectedDto[];

    @Expose()
    @Type(() => ProductInstructionWithSelectedDto)
    @ApiProperty({ type: [ProductInstructionWithSelectedDto] })
  instructions: ProductInstructionWithSelectedDto[];
}
