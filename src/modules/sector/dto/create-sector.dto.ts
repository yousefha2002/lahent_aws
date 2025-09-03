import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Language } from 'src/common/enums/language';

export class CreateSectorLanguageDto {
    @ApiProperty({example:"وجبات سريعة"})
    name: string;

    @ApiProperty({example:"ar"})
    languageCode: Language;
}

export class CreateSectorDto {
    @IsArray()
    @ApiProperty({ type: [CreateSectorLanguageDto], description: 'List of sectors translations' })
    languages: CreateSectorLanguageDto[];
}