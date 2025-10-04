import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class OrderItemExtraDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Extra Cheese' })
    name: string;

    @Expose()
    @ApiProperty({ example: 5 })
    additionalPrice: number;
}