import { Expose, Type } from 'class-transformer';
import { SimpleStoreDto } from 'src/modules/store/dto/simple-store.dto';

export class CartWithStoreDto {
    @Expose()
    id: number;

    @Expose()
    @Type(() => SimpleStoreDto)
    store: SimpleStoreDto;
}
