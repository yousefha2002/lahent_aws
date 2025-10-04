import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { OrderStatus } from "src/common/enums/order_status";
import { PickupType } from "src/common/enums/pickedup_type";
import { SimpleCustomerDto } from "src/modules/customer/dto/simple-customer.dto";
import { SimpleStoreDto } from "src/modules/store/dto/responses/simple-store.dto";

export class OrderListDto {
    @ApiProperty({ example: 123, description: 'Order ID' })
    @Expose()
    id: number;

    @ApiProperty({ example:OrderStatus.CANCELLED, description: 'Order status',enum:OrderStatus })
    @Expose()
    status: OrderStatus;

    @ApiProperty({ example: PickupType.DRIVE_THRU,enum:PickupType, description: 'Pickup type' })
    @Expose()
    pickupType: PickupType;

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

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت دفع العميل' })
    @Expose()
    paidAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت البدء بتحضير الطلب' })
    @Expose()
    preparedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت قبول الطلب من قبل المتجر' })
    @Expose()
    placedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت جدولة الطلب' })
    @Expose()
    scheduledAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت إلغاء الطلب' })
    @Expose()
    canceledAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت وصول العميل' })
    @Expose()
    arrivedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت تجهيز الطلب من قبل المتجر' })
    @Expose()
    readyAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت استلام العميل للطلب' })
    @Expose()
    receivedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت انتهاء انتظار الرد من قبل المتجر' })
    @Expose()
    confirmationTimeoutAt: Date | null;


    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'وقت إنشاء الطلب بواسطة العميل' })
    @Expose()
    createdAt: Date;

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