import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SectorLanguageDto {
    @ApiProperty({ example: 'وجبات سريعة' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'ar' })
    @Expose()
    languageCode: string;
}

export class SectorDto {
    @ApiProperty({ example: '1' })
    @Expose()
    id: string;

    @ApiProperty({ type: [SectorLanguageDto] })
    @Expose()
    @Type(() => SectorLanguageDto)
    languages: SectorLanguageDto[];
}