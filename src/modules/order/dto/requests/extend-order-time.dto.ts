import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class ExtendOrderTimeDto  {
    @ApiProperty({example:20})
    @Min(1)
    @Max(60)
    @IsNumber()
    extraMinutes:number
}