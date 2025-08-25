import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TypeLanguageDto } from './type.dto';

export class StoreTypeDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 'Electronics' })
    @Expose()
    name: string;

    @ApiProperty({ example: 'https://example.com/icon.png' })
    @Expose()
    iconUrl: string;

    @ApiProperty({ type: [TypeLanguageDto] })
    @Expose()
    @Type(() => TypeLanguageDto)
    languages: TypeLanguageDto[];
}