import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { StoreLanguageDto } from "./store-language.dto";
import { OpeningHourDTO } from "src/modules/opening_hour/dto/opening-hour.dto";
import { StoreStatus } from "src/common/enums/store_status";

export class CurrentStoreDTO {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;
    
    @ApiProperty({ type: [StoreLanguageDto] })
    @Expose()
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];

    @ApiProperty({ example: true })
    @Expose()
    driveThru: boolean;
    
    @ApiProperty({ example: false })
    @Expose()
    inStore: boolean;
    
    @ApiProperty({ type: [OpeningHourDTO] })
    @Expose()
    @Type(() => OpeningHourDTO)
    openingHours: OpeningHourDTO[];

    @ApiProperty({ example: false })
    @Expose()
    isOnline: boolean;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @Expose()
    logoUrl: string;

    @ApiProperty({ example: 'https://example.com/cover.png' })
    @Expose()
    coverUrl: string;

    @ApiProperty({ example: '966501234567' })
    @Expose()
    phone: string;

    @ApiProperty({ example: '966501234567' })
    @Expose()
    commercialRegister:string
    
    @ApiProperty({ example: '966501234567' })
    @Expose()
    taxNumber:string

    @ApiProperty({example:"approved"})
    @Expose()
    status:StoreStatus

    @ApiProperty({ example: '966501234567' })
    @Expose()
    phoneLogin: string;
}