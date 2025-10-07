import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SectorDto } from 'src/modules/sector/dto/sector.dto';
import { OpeningHourDTO } from 'src/modules/opening_hour/dto/opening-hour.dto';
import { StoreCustomerViewDto } from './customer-store.dto';

export class storeForAction extends StoreCustomerViewDto{
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

    @ApiProperty({ type: [OpeningHourDTO] })
    @Expose()
    @Type(() => OpeningHourDTO)
    openingHours: OpeningHourDTO[];

    @ApiProperty({ example: '2025-10-07T12:00:00Z', description: 'Store creation date' })
    @Expose()
    createdAt: Date;
}