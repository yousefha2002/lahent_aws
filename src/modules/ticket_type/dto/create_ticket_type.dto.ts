import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Language } from 'src/common/enums/language';

export class CreateTicketTypeLanguageDto {
    @ApiProperty({ example: 'Complaint' })
    name: string;

    @ApiProperty({ example: 'en' })
    languageCode: Language;
}

export class CreateTicketTypeDto {
    @IsArray()
    @ApiProperty({ type: [CreateTicketTypeLanguageDto] })
    languages: CreateTicketTypeLanguageDto[];
}
