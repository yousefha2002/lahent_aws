import { Expose, Transform, Type } from 'class-transformer';

export class SimpleStoreDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    address: string;

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
    token:string

    @Expose()
    refreshToken:string

    @Expose()
    @Type(()=>SimpleStoreDto)
    store:SimpleStoreDto
}