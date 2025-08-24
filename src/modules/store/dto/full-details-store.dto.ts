import { Expose, Type } from 'class-transformer';
import { StoreDto } from './Store.dto';

export class FullDetailsStoreDto {
    @Expose()
    @Type(() => StoreDto)
    store: StoreDto;

    @Expose()
    isFavorite:boolean
}