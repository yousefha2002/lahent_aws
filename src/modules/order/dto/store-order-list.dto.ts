import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { getOrderDate } from "src/common/utils/getOrderDate";
import { SimpleCustomerDto } from "src/modules/customer/dto/simple-customer.dto";
import { SimpleStoreDto } from "src/modules/store/dto/simple-store.dto";

export class OrderListDto {
    @ApiProperty({ example: 123, description: 'Order ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 'pending', description: 'Order status' })
    @Expose()
    status: string;

    @ApiProperty({ example: 'delivery', description: 'Pickup type' })
    @Expose()
    pickupType: string;

    @ApiProperty({ example: 30, description: 'Estimated time in minutes' })
    @Expose()
    estimatedTime: number;

    @ApiProperty({ example: 5, description: 'Number of products in order' })
    @Expose()
    productCount: number;

    @ApiProperty({ example: 1001, description: 'Order number' })
    @Expose()
    orderNumber: number;

    @ApiPropertyOptional({ type: () => SimpleCustomerDto, description: 'Customer information - just for store' })
    @Expose()
    @Type(() => SimpleCustomerDto)
    customer?: SimpleCustomerDto;

    @ApiProperty({ description: 'Order date', example: '2025-08-29T10:00:00.000Z' })
    @Expose()
    @Transform(({ obj }) => getOrderDate(obj))
    orderDate: Date;

    @ApiProperty({ description: 'Creation date', example: '2025-08-29T09:55:00.000Z' })
    @Expose()
    createdAt: string;

    @ApiProperty({ example: 250.5, description: 'Final price to pay' })
    @Expose()
    finalPriceToPay: number;

    @ApiPropertyOptional({ type: () => SimpleStoreDto, description: 'Store information just for customer' })
    @Expose()
    @Type(() => SimpleStoreDto)
    store?: SimpleStoreDto;
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