import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { storeForAction } from "./store-for-action.dto";
import { CommissionPercentDto } from "src/modules/store_commission/dto/store_comimssion.dto";

export class StoreAdminViewDto extends storeForAction {
    @ApiProperty({ type: CommissionPercentDto })
    @Expose()
    @Type(() => CommissionPercentDto)
    commission: CommissionPercentDto;
}