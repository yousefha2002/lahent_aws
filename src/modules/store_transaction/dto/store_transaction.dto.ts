import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SimpleCustomerDto } from 'src/modules/customer/dto/simple-customer.dto';

export class OrderDto {
    @Expose()
    @ApiProperty({ description: 'Order ID' })
    id: number;

    @Expose()
    @ApiProperty({ description: 'Order number' })
    orderNumber: number;

    @Expose()
    @ApiProperty({ description: 'Order paid date', nullable: true })
    paidAt: Date;

    @Expose()
    @Type(() => SimpleCustomerDto)
    @ApiProperty({ description: 'Customer info', type: SimpleCustomerDto })
    customer: SimpleCustomerDto;
}

export class StoreTransactionDto {
    @Expose()
    @ApiProperty({ description: 'Transaction ID' })
    id: number;

    @Expose()
    @ApiProperty({ description: 'Total amount of the order' })
    totalAmount: number;

    @Expose()
    @ApiProperty({ description: 'Commission percentage applied' })
    commissionPercent: number;

    @Expose()
    @ApiProperty({ description: 'Commission amount calculated' })
    commissionAmount: number;

    @Expose()
    @ApiProperty({ description: 'Amount received by store' })
    storeRevenue: number;

    @Expose()
    @Type(() => OrderDto)
    @ApiProperty({ description: 'Associated order', type: OrderDto })
    order: OrderDto;
}

export class PaginatedStoreTransactionDto {
    @Expose()
    @Type(() => StoreTransactionDto)
    @ApiProperty({ description: 'List of store transactions', type: [StoreTransactionDto] })
    data: StoreTransactionDto[];

    @Expose()
    @ApiProperty({ description: 'Total number of transactions' })
    total: number;

    @Expose()
    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}