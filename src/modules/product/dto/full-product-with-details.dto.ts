import { Expose, Type } from 'class-transformer';
import { SimpleOfferDto } from 'src/modules/offer/dto/simple-offer.dto';
import { BaseProductDto } from './base-product.dto';
import { VariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';
import { ExtraDto } from 'src/modules/product_extra/dto/extra-dto';
import { InstructionDto } from 'src/modules/product_instruction/dto/instruction-dto';

export class FullProductDetailsDto extends BaseProductDto {
    @Expose()
    product_number:number

    @Expose()
    sales:number

    @Expose()
    finalPrice: number;

    @Expose()
    @Type(() => VariantDto)
    variants: VariantDto[];

    @Expose()
    @Type(() => ExtraDto)
    extras: ExtraDto[];

    @Expose()
    @Type(() => InstructionDto)
    instructions: InstructionDto[];

    @Expose()
    @Type(() => SimpleOfferDto)
    offer: SimpleOfferDto | null;
}