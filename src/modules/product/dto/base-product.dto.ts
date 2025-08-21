import { Expose } from "class-transformer";

export class BaseProductDto {
    @Expose() id: number;
    @Expose() name: string;
    @Expose() basePrice: number;
    @Expose() images: string[];
    @Expose() shortDescription: string;
    @Expose() preparationTime: number;
    @Expose() longDescription: string;
    @Expose() categoryName: string | null;
}