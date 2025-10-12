import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { StoreTransactionType } from 'src/common/enums/transaction_type';
import { CustomerSummaryDto } from 'src/modules/customer/dto/customer.dto';

export class TransactionOrderDto {
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
    @Type(() => CustomerSummaryDto)
    @ApiProperty({ description: 'Customer info', type: CustomerSummaryDto })
    customer: CustomerSummaryDto;
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
    @ApiProperty({ description: 'status of transaction' })
    status: StoreTransactionType;

    @Expose()
    @Type(() => TransactionOrderDto)
    @ApiProperty({ description: 'Associated order', type: TransactionOrderDto })
    order: TransactionOrderDto;

    @Expose()
    @ApiProperty({ description: 'Date of creation', nullable: true })
    createdAt: Date;

    @Expose()
    @ApiProperty({ description: 'Note of transaction ', nullable: true })
    note: string;

    @Expose()
    @ApiProperty({ description: 'Recepit of url', nullable: true })
    recepit: string;
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