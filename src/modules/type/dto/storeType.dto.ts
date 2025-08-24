import { Expose, Type } from 'class-transformer';
import { TypeLanguageDto } from './type.dto';

export class StoreTypeDto {
    @Expose() id: number;
    @Expose() name: number;
    @Expose() iconUrl: string;

    @Expose()
    @Type(() => TypeLanguageDto)
    languages: TypeLanguageDto[];
}