import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from 'src/modules/product/dto/base-product.dto';
import { ProductExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { InstructionDto, ProductInstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
import { ProductVariantWithCategoryDto } from 'src/modules/prouduct_variant/dto/variant-dto';

class ProductWithOfferDto extends BaseProductDto {
    @Expose()
    @ApiProperty({ example: 120.5, description: 'Discounted price of the product' })
    discountedPrice: number;

    @Expose()
    @Type(() => SimpleOfferDto)
    @ApiProperty({ type: SimpleOfferDto, required: false, description: 'Applied offer details' })
    offer?: SimpleOfferDto;
}

export class CartItemWithOfferDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Please add extra sauce', description: 'Customer note for this cart item' })
    note: string;

    @Expose()
    @ApiProperty({ example: 2, description: 'Quantity of the product in the cart' })
    quantity: number;

    @Expose()
    @ApiProperty({ example: 150, description: 'Original product price before discount' })
    originalPrice: number;

    @Expose()
    @ApiProperty({ example: 120.5, description: 'Final price after discount applied' })
    finalPrice: number;

    @Expose()
    @ApiProperty({ example: 241, description: 'Total price = finalPrice * quantity' })
    totalPrice: number;

    @Expose()
    @Type(() => ProductWithOfferDto)
    @ApiProperty({ type: ProductWithOfferDto })
    product: ProductWithOfferDto;

    @Expose()
    @Type(() => ProductVariantWithCategoryDto)
    @ApiProperty({ type: [ProductVariantWithCategoryDto], description: 'Variants selected for the product' })
    variants: ProductVariantWithCategoryDto[];

    @Expose()
    @Type(() => ProductInstructionDto)
    @ApiProperty({ type: [ProductInstructionDto], description: 'Instructions selected for the product' })
    instructions: ProductInstructionDto[];

    @Expose()
    @Type(() => ProductExtraDto)
    @ApiProperty({ type: [ProductExtraDto], description: 'Extras added for the product' })
    extras: ProductExtraDto[];
}
