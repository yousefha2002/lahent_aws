import { Expose, Transform, Type } from 'class-transformer';
import { StoreSubTypeDto } from 'src/modules/subtype/dto/storeSubType.dto';
import { SimpleStoreDto } from './simple-store.dto';

export class StoreDto extends SimpleStoreDto{
    @Expose()
    @Type(() => StoreSubTypeDto)
    subType: StoreSubTypeDto;
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