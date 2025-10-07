import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { StoreTransactionType } from 'src/common/enums/transaction_type';

class BaseStoreTransactionDto {
    @ApiProperty({ example: 1, description: 'ID of the store' })
    @IsNumber()
    storeId: number;

    @ApiProperty({ example: 200, description: 'Amount involved in the transaction' })
    @IsNumber()
    @IsPositive()
    totalAmount: number;

    @ApiProperty({ enum: StoreTransactionType })
    @IsEnum(StoreTransactionType)
    status: StoreTransactionType;
}

export class CreateStoreTransactionDto extends BaseStoreTransactionDto{
    @ApiProperty({ example: 101, description: 'ID of the related order' })
    @IsNumber()
    orderId: number;
}

export class CreateAdminStoreTransactionDto extends BaseStoreTransactionDto {}