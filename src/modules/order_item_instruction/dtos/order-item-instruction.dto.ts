import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class OrderItemInstructionDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Cooking Instructions' })
    name: string;
}