import { Expose, Type } from 'class-transformer';
import { ProductVariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';
import { VariantCategoryDto, VariantCategoryLanguageDto } from './variant_category.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryWithVariantsDto extends VariantCategoryDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @Type(() => VariantCategoryLanguageDto)
    @ApiProperty({ type: [VariantCategoryLanguageDto] })
    languages: VariantCategoryLanguageDto[];

    @Expose()
    @Type(() => ProductVariantDto)
    @ApiProperty({ type: [ProductVariantDto] })
    variants: ProductVariantDto[];
}