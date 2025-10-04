import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { StoreStatus } from "src/common/enums/store_status";
import { StoreCustomerViewDto } from "./customer-store.dto";

class StoreOwnerViewDto extends StoreCustomerViewDto{
    @ApiProperty({example:"approved"})
    @Expose()
    status:StoreStatus
}

export class OwnerStoresResponseDto {
    @ApiProperty({ type: [StoreOwnerViewDto] })
    @Type(() => StoreOwnerViewDto)
    @Expose()
    stores: StoreOwnerViewDto[];

    @ApiProperty({ example: true, description: 'True if there is at least one store with incomplete profile' })
    @Expose()
    hasIncompleteStore: boolean;
}