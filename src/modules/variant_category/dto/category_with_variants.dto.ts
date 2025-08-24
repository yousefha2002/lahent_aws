import { Expose, Type } from 'class-transformer';
import { ProductVariantDto } from 'src/modules/prouduct_variant/dto/variant-dto';
import { VariantCategoryDto, VariantCategoryLanguageDto } from './variant_category.dto';

export class CategoryWithVariantsDto extends VariantCategoryDto{
    @Expose()
    id: number;

    @Expose()
    @Type(() => VariantCategoryLanguageDto)
    languages: VariantCategoryLanguageDto[];

    @Expose()
    @Type(() => ProductVariantDto)
    variants: ProductVariantDto[];
}