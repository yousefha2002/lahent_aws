import { Expose } from "class-transformer";

export class StoreTypeDto {
    @Expose() id: number;
    @Expose() name: string;
    @Expose() iconUrl: string;
}