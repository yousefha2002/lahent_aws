import { Expose, Transform, Type } from 'class-transformer';
import { StoreLanguageDto } from './store-language.dto';

export class SimpleStoreDto {
    @Expose()
    id: number;

    @Expose()
    @Type(() => StoreLanguageDto)
    languages: StoreLanguageDto[];

    @Expose()
    city:string

    @Expose()
    logoUrl: string;

    @Expose()
    coverUrl: string;

    @Expose()
    phone: string;

    @Expose()
    lng: number;

    @Expose()
    lat: number;

    @Expose()
    openTime:string | null

    @Expose()
    closeTime:string | null

    @Expose()
    @Transform(({ obj }) =>obj.numberOfRates > 0 ? obj.rate / obj.numberOfRates : 0)
    averageRating: number;

    @Expose()
    numberOfRates:string
}

export class StoreWithTokenDto{
    @Expose()
    accessToken:string

    @Expose()
    refreshToken:string

    @Expose()
    @Type(()=>SimpleStoreDto)
    store:SimpleStoreDto
}