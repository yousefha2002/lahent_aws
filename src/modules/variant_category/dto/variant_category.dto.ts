import { Expose, Type } from 'class-transformer';

export class VariantCategoryLanguageDto {
    @Expose()
    languageCode: string;

    @Expose()
    name: string;
}

export class VariantCategoryDto {
    @Expose()
    id: number;

    @Expose()
    @Type(() => VariantCategoryLanguageDto)
    languages: VariantCategoryLanguageDto[];
}