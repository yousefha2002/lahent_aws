import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from 'src/modules/product/dto/responses/base-product.dto';
import { ProductExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { ProductInstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';
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
    @ApiProperty({ example: 200, description: 'Original product price before discount' })
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

export class CartWithTotalsDto {
    @Expose()
    @Type(() => CartItemWithOfferDto)
    @ApiProperty({ type: [CartItemWithOfferDto], description: 'List of cart items' })
    items: CartItemWithOfferDto[];

    @Expose()
    @ApiProperty({ example: 500, description: 'Total base price' })
    totalOriginalPrice: number;

    @Expose()
    @ApiProperty({ example: 40, description: 'Discount Amount after applying offers for products' })
    offersDiscount: number;

    @Expose()
    @ApiProperty({ example: 30, description: 'Coupon discount amount applied to the cart' })
    couponDiscountAmount: number;

    @Expose()
    @ApiProperty({ example: 430, description: 'Total price after discount for all items' })
    totalFinalPrice: number;

    @Expose()
    @ApiProperty({ example: 20, description: 'Total points earned' })
    pointsEarned: number;

    @Expose()
    @ApiProperty({ example: 15, description: 'Time of preparing order' })
    estimatedTime:number
}