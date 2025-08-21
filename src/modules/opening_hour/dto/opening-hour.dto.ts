import { Expose } from "class-transformer";

export class OpeningHourDTO {
    @Expose()
    id:number

    @Expose()
    day:string

    @Expose()
    openTime:string |null

    @Expose()
    closeTime:string |null
}