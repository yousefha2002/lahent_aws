import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleStoreDto } from 'src/modules/store/dto/simple-store.dto';

export class CartWithStoreDto {
    @Expose()
    @ApiProperty({ example: 1, description: 'ID of the cart' })
    id: number;

    @Expose()
    @Type(() => SimpleStoreDto)
    @ApiProperty({ type: SimpleStoreDto, description: 'Store details for the cart' })
    store: SimpleStoreDto;
}