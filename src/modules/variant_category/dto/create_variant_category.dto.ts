import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class VariantCategoryLanguageInput {
    @IsString()
    @IsNotEmpty()
    languageCode: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateVariantCategoryDto {
    @IsArray()
    @Type(() => VariantCategoryLanguageInput)
    languages: VariantCategoryLanguageInput[];
}