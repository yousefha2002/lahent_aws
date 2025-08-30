import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class SimpleOfferDto {
    @ApiProperty({ example: 1 })
    @Expose()
    id: number;

    @ApiProperty({ example: 'fixed',description:"fixed or percentage or incentive" })
    @Expose() 
    type: string;

    @ApiProperty({ example: 2 })
    @Expose()
    buyQty: number | null;

    @ApiProperty({ example: 1 })
    @Expose()
    getFreeQty: number | null;

    @ApiProperty({ example: 5 })
    @Expose()
    discountAmount?: number | null;

    @ApiProperty({ example: 10 })
    @Expose()
    discountPercentage?: number | null;
}