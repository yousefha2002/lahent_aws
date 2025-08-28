import { Expose, Type } from "class-transformer";
import { StoreTypeDto } from "src/modules/type/dto/storeType.dto";
import { SubTypeLanguageDto } from "./subType.dto";
import { ApiProperty } from "@nestjs/swagger";

export class StoreSubTypeDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ type: [SubTypeLanguageDto] })
    @Expose()
    @Type(() => SubTypeLanguageDto)
    languages: SubTypeLanguageDto[];

    @ApiProperty({ type: StoreTypeDto })
    @Expose()
    @Type(() => StoreTypeDto)
    type: StoreTypeDto;
}