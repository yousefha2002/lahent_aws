import { Expose } from "class-transformer";

export class InstructionDto {
    @Expose()
    id: number;

    @Expose()
    text: string;
}