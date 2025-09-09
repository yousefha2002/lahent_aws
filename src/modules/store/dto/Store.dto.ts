import { Expose, Type } from 'class-transformer';
import { SimpleStoreDto } from './simple-store.dto';
import { StoreSubTypeDto } from 'src/modules/subtype/dto/storeSubType.dto';
import { ApiProperty } from '@nestjs/swagger';
import { StoreStatus } from 'src/common/enums/store_status';
import { SectorDto } from 'src/modules/sector/dto/sector.dto';

export class StoreDto extends SimpleStoreDto{
    @ApiProperty({ type: StoreSubTypeDto })
    @Expose()
    @Type(() => StoreSubTypeDto)
    subType: StoreSubTypeDto[];
}

export class OwnerStoreDto extends StoreDto{
    @ApiProperty({example:"approved"})
    @Expose()
    status:StoreStatus
}

export class storeForAction extends StoreDto{
    @ApiProperty({ type: SectorDto })
    @Type(() => SectorDto)
    @Expose()
    sector:SectorDto

    @ApiProperty({ example: '966501234567' })
    @Expose()
    phoneLogin: string;

    @ApiProperty({ example: '966501234567' })
    @Expose()
    commercialRegister:string

    @ApiProperty({ example: '966501234567' })
    @Expose()
    taxNumber:string
}

export class PaginatedStoreDto {
    @ApiProperty({ type: [StoreDto] })
    @Expose()
    @Type(() => StoreDto)
    stores: StoreDto[];

    @ApiProperty({ example: 10 })
    @Expose()
    totalItems: number;

    @ApiProperty({ example: 2 })
    @Expose()
    totalPages: number;
}