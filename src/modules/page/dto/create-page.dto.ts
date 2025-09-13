import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Language } from 'src/common/enums/language';
import { PageType } from 'src/common/enums/page_type';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageContentDto {
    @ApiProperty({
        description: 'Language code of the content',
        enum: Language,
        example: 'en'
    })
    @IsNotEmpty()
    @IsEnum(Language)
    languageCode: Language;
    
    @ApiProperty({
        description: 'HTML content of the page',
        example: '<p>This is the privacy policy in English.</p>'
    })
    @IsNotEmpty()
    @IsString()
    content: string;
}

export class CreatePageDto {
    @ApiProperty({
        description: 'Type of the page',
        enum: PageType,
        example: 'PP'
    })
    @IsEnum(PageType)
    type: PageType; 

    @ApiProperty({
        description: 'Contents of the page in multiple languages',
        type: [CreatePageContentDto],
        example: [
            {
                languageCode: 'en',
                content: '<p>This is the privacy policy in English.</p>'
            },
            {
                languageCode: 'ar',
                content: '<p>هذه هي سياسة الخصوصية باللغة العربية.</p>'
            }
        ]
    })
    @ValidateNested({ each: true })
    @Type(() => CreatePageContentDto)
    contents: CreatePageContentDto[];
}