import { Expose, Type } from 'class-transformer';
import { StoreDto } from './Store.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FullDetailsStoreDto {
    @ApiProperty({ type: [StoreDto] })
    @Expose()
    @Type(() => StoreDto)
    store: StoreDto;

    @ApiProperty({description: 'Indicates if the store is marked as favorite by the current customer',example: true})
    @Expose()
    isFavorite:boolean
}