import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { StoreTransactionType } from 'src/common/enums/transaction_type';

export class CreateStoreTransactionDto {
    @ApiProperty({ example: 1, description: 'ID of the store' })
    @IsNumber()
    storeId: number;

    @ApiProperty({ example: 101, description: 'ID of the related order' })
    @IsNumber()
    orderId: number;

    @ApiProperty({ example: 200, description: 'Total order amount' })
    @IsNumber()
    @IsPositive()
    totalAmount: number;

    @ApiProperty({example:StoreTransactionType.REFUND})
    @IsEnum(StoreTransactionType)
    status:StoreTransactionType
}