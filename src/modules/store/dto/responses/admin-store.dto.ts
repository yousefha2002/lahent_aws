import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { storeForAction } from "./store-for-action.dto";
import { CommissionPercentDto } from "src/modules/store_commission/dto/store_comimssion.dto";
import { OwnerDto } from "src/modules/owner/dto/owner.dto";
import { StoreStatus } from "src/common/enums/store_status";

export class StoreAdminViewDto extends storeForAction {
    @ApiProperty({ type: CommissionPercentDto })
    @Expose()
    @Type(() => CommissionPercentDto)
    commission: CommissionPercentDto;

    @ApiProperty({ type: OwnerDto })
    @Type(() => OwnerDto)
    @Expose()
    owner:OwnerDto

    @ApiProperty({example:StoreStatus.APPROVED})
    @Expose()
    status:StoreStatus

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z'})
    @Expose()
    lastActive: Date | null;
}