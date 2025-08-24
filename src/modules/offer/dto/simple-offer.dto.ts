import { Expose } from "class-transformer";

export class SimpleOfferDto {
    @Expose()
    id: number;

    @Expose()
    buyQty: number | null;

    @Expose()
    getFreeQty: number | null;

    @Expose()
    discountAmount?: number | null;

    @Expose()
    discountPercentage?: number | null;
}