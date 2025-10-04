import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SectorDto } from 'src/modules/sector/dto/sector.dto';

class StoreLanguageInfoDto {
    @ApiProperty({ example: 'en' })
    @Expose()
    languageCode: string;

    @ApiProperty({ example: 'Nike' })
    @Expose()
    brand: string;
}

class IncompleteStoreDto {
    @ApiProperty({ example: 1 })
    @Expose()
    storeId: number;

    @ApiProperty({ type: [StoreLanguageInfoDto] })
    @Expose()
    @Type(() => StoreLanguageInfoDto)
    languages: StoreLanguageInfoDto[];

    @ApiProperty({ type: SectorDto })
    @Type(() => SectorDto)
    @Expose()
    sector:SectorDto
}

export class IncompleteStoreResponseDto {
    @ApiProperty({ type: IncompleteStoreDto, nullable: true })
    @Expose()
    @Type(() => IncompleteStoreDto)
    store?: IncompleteStoreDto;

    @ApiProperty({ example: true })
    @Expose()
    hasIncompleteStore: boolean;
}