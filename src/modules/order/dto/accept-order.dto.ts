import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, Max, Min } from "class-validator";

export class AcceptOrderDto  {
    @ApiPropertyOptional({example:5})
    @Min(1)
    @Max(15)
    @IsNumber()
    @IsOptional()
    extraMinutes:number
}