import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleStoreDto } from 'src/modules/store/dto/responses/simple-store.dto';
import { OrderStatus } from 'src/common/enums/order_status';
import { PickupType } from 'src/common/enums/pickedup_type';
import { CustomerSummaryDto } from 'src/modules/customer/dto/customer.dto';

export class BaseOrderDto {
    @ApiProperty({ example: 1, description: 'Order ID' })
    @Expose()
    id: number;

    @ApiProperty({ example: 1001, description: 'Order number' })
    @Expose()
    orderNumber: number;

    @ApiProperty({ example: OrderStatus.PENDING_PAYMENT, enum: OrderStatus, description: 'Order status' })
    @Expose()
    status: OrderStatus;

    @ApiProperty({ example: PickupType.DRIVE_THRU, enum: PickupType, description: 'Pickup type' })
    @Expose()
    pickupType: PickupType;

    @ApiProperty({ example: 30, description: 'Estimated time in minutes' })
    @Expose()
    estimatedTime: number;

    @ApiProperty({ example: 250.5, description: 'Final price to pay' })
    @Expose()
    finalPriceToPay: number;

    @ApiPropertyOptional({ type: () => SimpleStoreDto, description: 'Store information', nullable: true })
    @Expose()
    @Type(() => SimpleStoreDto)
    store?: SimpleStoreDto;

    @ApiPropertyOptional({ type: () => CustomerSummaryDto, description: 'Customer information - just for store' })
    @Expose()
    @Type(() => CustomerSummaryDto)
    customer?: CustomerSummaryDto;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the customer paid (can be null)' })
    @Expose()
    paidAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the order was prepared by store' })
    @Expose()
    preparedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the order was placed' })
    @Expose()
    placedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Scheduled time for the order' })
    @Expose()
    scheduledAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the order was canceled' })
    @Expose()
    canceledAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the customer arrived' })
    @Expose()
    arrivedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the order is ready' })
    @Expose()
    readyAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the order was received by the customer' })
    @Expose()
    receivedAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Order confirmation timeout' })
    @Expose()
    confirmationTimeoutAt: Date | null;

    @ApiProperty({ example: '2025-08-29T10:00:00.000Z', description: 'Time when the order was created by the customer' })
    @Expose()
    createdAt: Date;
}