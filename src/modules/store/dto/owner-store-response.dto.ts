import { ApiProperty } from "@nestjs/swagger";
import { OwnerStoreDto } from "./Store.dto";
import { Expose, Type } from "class-transformer";

export class OwnerStoresResponseDto {
    @ApiProperty({ type: [OwnerStoreDto] })
    @Type(() => OwnerStoreDto)
    @Expose()
    stores: OwnerStoreDto[];

    @ApiProperty({ example: true, description: 'True if there is at least one store with incomplete profile' })
    @Expose()
    hasIncompleteStore: boolean;
}