import { Expose } from "class-transformer";

export class ReorderResponseDto {
    @Expose()
    message: string;
}