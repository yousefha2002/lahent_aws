import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class OrderItemVariantDto {
    @Expose()
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @ApiProperty({ example: 'Extra Cheese' })
    name: string;

    @Expose()
    @ApiProperty({ example: 'Size' })
    category: string;

    @Expose()
    @ApiProperty({ example: 5 })
    additionalPrice: number;

    @Expose()
    @ApiProperty({ example: 'https://example.com/image.png', nullable: true })
    imageUrl: string | null;
}