import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { StoreLanguageDto } from "./store-language.dto";

export class QuickViewStoreDto {
    @ApiProperty({ example: 101 })
    @Expose() id:number;

    @ApiProperty({ example: 'https://example.com/logo.png' })
    @Expose() logoUrl: string;

    @ApiProperty({ example: 'Riyadh' })
    @Expose() city: string;

    @ApiProperty({ type: [StoreLanguageDto] })
    @Expose()
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];
}