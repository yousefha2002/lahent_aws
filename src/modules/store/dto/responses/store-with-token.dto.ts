import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { SimpleStoreDto } from "./simple-store.dto";

export class StoreWithTokenDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @Expose()
    accessToken: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    @Expose()
    refreshToken: string;

    @ApiProperty({ type: SimpleStoreDto })
    @Expose()
    @Type(() => SimpleStoreDto)
    store: SimpleStoreDto;
}