import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

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
}