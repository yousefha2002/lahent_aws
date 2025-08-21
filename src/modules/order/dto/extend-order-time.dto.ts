import { IsNumber, Min } from "class-validator";

export class ExtendOrderTimeDto  {
    @Min(1)
    @IsNumber()
    extraMinutes:number
}