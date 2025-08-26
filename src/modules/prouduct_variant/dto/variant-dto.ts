import { Expose, Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { Language } from "src/common/enums/language";

export class VariantDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    additional_price: number;

    @Expose()
    imageUrl: string | null;
}

export class ProductVariantLanguageDto {
    @Expose()
    @IsString()
    @IsIn(Object.values(Language))
    languageCode: Language;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class ProductVariantDto {
    @Expose()
    id: number;

    @Expose()
    additional_price: number;

    @Expose()
    imageUrl: string | null;

    @Expose()
    isActive:boolean

    @Expose()
    @Type(() => ProductVariantLanguageDto)
    languages: ProductVariantLanguageDto[];
}