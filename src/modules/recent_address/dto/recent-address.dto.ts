import { Expose } from "class-transformer";

export class RecentAddressDto {
    @Expose()
    id:number

    @Expose()
    address:string

    @Expose()
    lat:number

    @Expose()
    lng:number
}