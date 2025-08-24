import { Expose, Type } from 'class-transformer';
import { SimpleStoreDto } from './simple-store.dto';
import { StoreSubTypeDto } from 'src/modules/subtype/dto/storeSubType.dto';

export class StoreDto extends SimpleStoreDto{
    @Expose()
    @Type(() => StoreSubTypeDto)
    subType: StoreSubTypeDto[];
}

export class PaginatedStoreDto {
    @Expose()
    @Type(() => StoreDto)
    stores: StoreDto[];

    @Expose()
    totalItems:number

    @Expose()
    totalPages:number
}