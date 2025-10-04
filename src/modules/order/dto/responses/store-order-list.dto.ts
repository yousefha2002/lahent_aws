import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { SimpleOrderDto } from "./simple-order.dto";

export class OrderListDto extends SimpleOrderDto {
    @ApiProperty({ example: 5, description: 'Number of products in order' })
    @Expose()
    productCount: number;
}

export class PaginatedOrderListDto {
    @ApiProperty({ example: 5, description: 'Total number of pages' })
    @Expose()
    totalPages: number;

    @ApiProperty({ example: 50, description: 'Total number of orders' })
    @Expose()
    totalItems: number;

    @ApiProperty({ type: () => [OrderListDto], description: 'List of orders' })
    @Expose()
    @Type(() => OrderListDto)
    orders: OrderListDto[];
}