import { Expose } from "class-transformer";

export class AddressDto {
    @Expose()
    id:number

    @Expose()
    address:string

    @Expose()
    label:string

    @Expose()
    lat:number

    @Expose()
    lng:number
}