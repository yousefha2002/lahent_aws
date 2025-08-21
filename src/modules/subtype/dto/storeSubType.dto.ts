import { Expose, Type } from "class-transformer";
import { StoreTypeDto } from "src/modules/type/dto/storeType.dto";

export class StoreSubTypeDto {
    @Expose() id: number;
    @Expose() name: string;

    @Expose()
    @Type(() => StoreTypeDto)
    type: StoreTypeDto;
}