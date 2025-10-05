import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SectorDto } from 'src/modules/sector/dto/sector.dto';
import { OwnerDto } from 'src/modules/owner/dto/owner.dto';

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

// -------- Admin DTO --------
export class AdminIncompleteStoreDto extends IncompleteStoreDto {
    @ApiProperty({ type: OwnerDto })
    @Expose()
    @Type(() => OwnerDto)
    owner: OwnerDto;
}

export class PaginatedAdminIncompleteStoresDto {
    @ApiProperty({ type: [AdminIncompleteStoreDto] })
    @Expose()
    @Type(() => AdminIncompleteStoreDto)
    stores: AdminIncompleteStoreDto[];

    @ApiProperty({ example: 5 })
    @Expose()
    totalPages: number;

    @ApiProperty({ example: 50 })
    @Expose()
    totalItems: number;
}