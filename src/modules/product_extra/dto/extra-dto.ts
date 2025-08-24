import { Expose, Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsString, ValidateNested,IsArray } from "class-validator";
import { Language } from "src/common/enums/language";

export class ExtraDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    additional_price: number;
}

export class ProductExtraDto {
    @Expose()
    id:number

    @Expose()
    @IsNumber()
    additional_price: number;

    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductExtraLanguageDto)
    languages: ProductExtraLanguageDto[];
}

export class ProductExtraLanguageDto {
    @Expose()
    @IsString()
    @IsIn(Object.values(Language))
    languageCode: Language;

    @Expose()
    @IsString()
    @IsNotEmpty()
    name: string;
}