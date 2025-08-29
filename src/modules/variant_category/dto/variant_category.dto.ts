import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class VariantCategoryLanguageDto {
    @Expose()
    @ApiProperty({ example: 'en' })
    languageCode: string;

    @Expose()
    @ApiProperty({ example: 'Size' })
    name: string;
}

export class VariantCategoryDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @Type(() => VariantCategoryLanguageDto)
    @ApiProperty({ type: [VariantCategoryLanguageDto] })
    languages: VariantCategoryLanguageDto[];
}