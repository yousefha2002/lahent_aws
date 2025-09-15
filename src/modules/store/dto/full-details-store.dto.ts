import { Expose, Type } from 'class-transformer';
import { StoreDto } from './Store.dto';
import { ApiProperty } from '@nestjs/swagger';

export class StoreWihtPickedUpMethods extends StoreDto {
    @ApiProperty({example: true})
    @Expose()
    inStore:boolean

    @ApiProperty({ example: true })
    @Expose()
    driveThru: boolean;
}

export class FullDetailsStoreDto {
    @ApiProperty({ type: [StoreWihtPickedUpMethods] })
    @Expose()
    @Type(() => StoreWihtPickedUpMethods)
    store: StoreWihtPickedUpMethods;

    @ApiProperty({description: 'Indicates if the store is marked as favorite by the current customer',example: true})
    @Expose()
    isFavorite:boolean
}