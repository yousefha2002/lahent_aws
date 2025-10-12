import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
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

export class CreateAdminStoreTransactionDto extends BaseStoreTransactionDto {
    @ApiPropertyOptional({ example: 101})
    @IsNumber()
    note: string;

    @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Upload a receipt(optional)' })
    @IsOptional()
    receipt?: any;
}