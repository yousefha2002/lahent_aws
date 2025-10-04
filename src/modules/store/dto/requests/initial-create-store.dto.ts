import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from 'src/common/enums/language';

class StoreLanguageDto {
    @ApiProperty({ example: 'en', description: 'Language code for the brand' })
    @IsEnum(Language)
    languageCode: Language;

    @ApiProperty({ example: 'Nike', description: 'Brand name in this language' })
    @IsString()
    @IsNotEmpty()
    brand: string;
}

export class InitialCreateStoreDto {
    @ApiProperty({ example: 1, description: 'Sector ID of the store' })
    @IsNumber()
    sectorId: number;

    @ApiProperty({
        type: [StoreLanguageDto],
        description: 'Array of languages with brand name',
        example: [
        { languageCode: 'en', brand: 'Nike' },
        { languageCode: 'ar', brand: 'نايكي' },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];
}
