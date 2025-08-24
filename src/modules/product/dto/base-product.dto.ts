import { Expose, Type } from "class-transformer";
import { Language } from "src/common/enums/language";
import { SimpleCategoryDto } from "src/modules/category/dto/category.dto";

export class ProductLanguageDto {
    @Expose() languageCode: Language
    @Expose() name: string;
    @Expose() shortDescription: string;
    @Expose() longDescription: string;
}

export class BaseProductDto {
    @Expose() id: number;
    @Expose() basePrice: number;
    @Expose()
    @Type(() => ProductLanguageDto)
    languages: ProductLanguageDto[];
    @Expose() images: string[];
    @Expose() preparationTime: number;
    @Expose()
    @Type(()=>SimpleCategoryDto)
    category:SimpleCategoryDto
}