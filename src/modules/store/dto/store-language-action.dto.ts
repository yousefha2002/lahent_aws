import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Language } from 'src/common/enums/language';
import { ApiProperty } from '@nestjs/swagger';

export class StoreLanguageActionDto {
    @ApiProperty({ enum: Language, example: 'en' })
    @IsEnum(Language)
    languageCode: Language;

    @ApiProperty({ example: 'My Store' })
    @IsString()
    @IsNotEmpty()
    name: string;
}