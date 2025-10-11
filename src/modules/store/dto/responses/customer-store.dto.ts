import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { StoreSubTypeDto } from "src/modules/subtype/dto/storeSubType.dto";
import { SimpleStoreDto } from "./simple-store.dto";

export class StoreCustomerViewDto extends SimpleStoreDto{
    @ApiProperty({ type: StoreSubTypeDto })
    @Expose()
    @Type(() => StoreSubTypeDto)
    subType: StoreSubTypeDto[];

    @ApiProperty({example: 3})
    @Expose()
    distance:number
}

export class PaginatedCustomerStoreViewDto {
    @ApiProperty({ type: [StoreCustomerViewDto] })
    @Expose()
    @Type(() => StoreCustomerViewDto)
    stores: StoreCustomerViewDto[];

    @ApiProperty({ example: 10 })
    @Expose()
    totalItems: number;

    @ApiProperty({ example: 2 })
    @Expose()
    totalPages: number;
}


export class FullDetailsCustomerStoreViewDto {
    @ApiProperty({ type: [StoreCustomerViewDto] })
    @Expose()
    @Type(() => StoreCustomerViewDto)
    store: StoreCustomerViewDto;

    @ApiProperty({description: 'Indicates if the store is marked as favorite by the current customer',example: true})
    @Expose()
    isFavorite:boolean

    @ApiProperty({example: 20})
    @Expose()
    ordersCount:number
}