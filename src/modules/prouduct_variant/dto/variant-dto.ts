import { Expose } from "class-transformer";

export class VariantDto {
    @Expose()
    id: number;

    @Expose()
    type: string;

    @Expose()
    name: string;

    @Expose()
    priceDiff: number;

    @Expose()
    imageUrl: string | null;
}