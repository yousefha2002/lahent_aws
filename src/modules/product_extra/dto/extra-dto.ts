import { Expose } from "class-transformer";

export class ExtraDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    price: number;
}