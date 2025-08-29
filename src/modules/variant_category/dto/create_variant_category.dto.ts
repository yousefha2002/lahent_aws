import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VariantCategoryLanguageInput {
    @ApiProperty({ description: 'Language code', example: 'en' })
    @IsString()
    @IsNotEmpty()
    languageCode: string;

    @ApiProperty({ description: 'Name of the variant category in this language', example: 'Size' })
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CreateVariantCategoryDto {
    @ApiProperty({ type: [VariantCategoryLanguageInput], description: 'List of translations for the category' })
    @IsArray()
    @Type(() => VariantCategoryLanguageInput)
    languages: VariantCategoryLanguageInput[];
}